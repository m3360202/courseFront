'use client'

import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { minLength, nonEmpty, object, pipe, string, optional, array, date, number, nullable } from 'valibot'

import InitialSearch from './InitialSearch'
import SearchResults from './SearchResults'
import { searchCourses, searchOrgs } from '@/api/search'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { Organization } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { Course } from '@/types/course'
import { transformLocalDateZoneToUTC } from '@/utils/date'
import { useObjectCookie } from '@/@core/hooks/useObjectCookie'
import CookiesKey from '@/types/cookiesKey'
import { useSearchParams } from 'next/navigation'

const schema = object({
  text: pipe(string(), nonEmpty('Search content required!'), minLength(1)),
  startTime: optional(nullable(date())),
  endTime: optional(nullable(date())),
  timetable: optional(array(number())),
  address: optional(string()),
  classroomInfo: optional(string())
})

interface FormValues {
  text: string
  startTime?: string
  endTime?: string
  timetable?: number[]
  address?: string
  classroomInfo?: string
}

const Search = () => {
  const methods = useForm<FormValues>({
    mode: 'onChange',
    resolver: valibotResolver(schema)
  })

  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Array<Course>>([])
  const [organizations, setOrganizations] = useState<Array<Organization>>([])
  const { setSource } = useGlobal()

  const user = useUser() as UserTable
  const [searchToCookie, setSearchToCookie] = useObjectCookie<string | null>(CookiesKey.SearchParams, null)
  const searchParams = useSearchParams()


  useEffect(() => {
    setSource('searchPage')
  }, [])

  const onSubmit: SubmitHandler<FormValues> = async data => {
    const { text, startTime, endTime, timetable, address, classroomInfo } = data
    try {
      setLoading(true)

      if (text) {
        setSearchToCookie(text)
      }

      const orgSearchParams = {
        user,
        text
      }

      let startTimeUTC = ''
      if (startTime) {
        startTimeUTC = transformLocalDateZoneToUTC(startTime, user)
      }
      let endTimeUTC = ''
      if (endTime) {
        endTimeUTC = transformLocalDateZoneToUTC(endTime, user)
      }

      const courseSearchParams = {
        user,
        params: {
          text,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          week: timetable,
          address,
          classroom: classroomInfo
        }
      }
      const [orgData, courseData] = await Promise.all([searchOrgs(orgSearchParams), searchCourses(courseSearchParams)])
      setOrganizations(orgData.data)
      setCourses(courseData.data)
      setSearched(true)
    } catch (error) {
      console.error('Error fetching search:', error)
    } finally {
      setLoading(false)
    }
  }

  const { watch, handleSubmit, setValue } = methods
  useEffect(() => {
    if (searched) {
      handleSubmit(onSubmit)()
    }
  }, [watch('startTime'), watch('endTime'), watch('timetable'), watch('address'), watch('classroomInfo')])

  useEffect(() => {
    if (searchParams.get('redirectTo')) {
      const text = searchToCookie
      if (user && text) {
        setValue('text', text)
        handleSubmit(onSubmit)()
      }
    } else {
      setSearchToCookie(null)
    }

    //return () => localStorage.removeItem('searchText')
  }, [user])

  return (
    <FormProvider {...methods}>
      <Backdrop open={loading} style={{ zIndex: 1300 }} invisible={false}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Box sx={{ height: '100%', width: '100%' }}>
        {searched ? (
          <SearchResults courses={courses} organizations={organizations} onSearch={onSubmit} />
        ) : (
          <InitialSearch onSearch={onSubmit} />
        )}
      </Box>
    </FormProvider>
  )
}

export default Search
