'use client'

import { useEffect, useState } from 'react'

// Hooks Imports
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { useDictionary } from '@/hooks/useDictionary'
import { useCourse } from '@/hooks/useCourse'

// Type Imports
import type { Course } from '@/types/course'
import { UserTable } from '@/types/user/UserTable'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import Editor from '@/components/editor'
import { Card } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { success, error } from '@/utils/toasts'
import { convertFromRaw, EditorState } from 'draft-js'
import useDescription from '@/hooks/useDescription'

// Api Imports
import saveCourse from '@/api/course/saveCourse'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import FormLayout from '@/components/layout/FormLayout'

const SaveCourseDescription = () => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)
  const [value, setContentValue] = useState<EditorState | undefined>()

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { course } = useCourse()
  const { setBackUrl, setTitle } = useGlobal()
  const { lang: locale } = useParams()

  useEffect(() => {
    setBackUrl([getLocalizedUrl(`/course/${course?._id}/detail`, locale as Locale)])
    setTitle('Edit course description')

    return () => {
      //setBackUrl(null)
    }
  }, [])

  const { control, setValue, handleSubmit } = useForm()

  useDescription(value, setValue)

  const onSubmit = async (data: any) => {
    if (!data || !data.description) {
      error('Please enter a description')
    }
    setSaveLoading(true)
    try {
      const responseData: Course = {
        _id: course?._id as string, // 确保这里不会是 undefined 或 null
        title: course?.title as string, // 确保这些属性来自 course 对象
        description: data.description,
        descriptionObj: data.descriptionObj,
        startTime: course?.startTime as string,
        endTime: course?.endTime as string,
        lessonStartTime: course?.lessonStartTime as string,
        labels: course?.labels || null, // 如果 labels 是可选的，确保处理 undefined 的情况
        totalLessons: course?.totalLessons as number,
        lessonDuration: course?.lessonDuration as number,
        timetable: course?.timetable as number[],
        timeZone: course?.timeZone as string,
        code: course?.code as string
      }

      await saveCourse(user as UserTable, responseData)

      success('Course description saved successfully')
      setSaveLoading(false)
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  useEffect(() => {
    if (course && course.descriptionObj) {
      setContentValue(
        EditorState.createWithContent(
          convertFromRaw({
            entityMap: course?.descriptionObj?.entityMap || {},
            blocks: course?.descriptionObj?.blocks || []
          })
        )
      )
    }
  }, [])

  return (
    <FormLayout>
      <Card>
        <div className='p-5'>
          <div className='flex flex-col gap-5'>
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={() => (
                <Editor user={user as UserTable} value={value} setContentValue={setContentValue} />
              )}
            />

            <LoadingButton onClick={handleSubmit(onSubmit)} loading={saveLoading}>
              {dictionary.common.submit}
            </LoadingButton>
          </div>
        </div>
      </Card>
    </FormLayout>
  )
}

export default SaveCourseDescription
