'use client'

import type { ReactNode } from 'react'
import Card from '@mui/material/Card'

import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import { useGlobal } from '@/hooks/useGlobal'
import { useEffect } from 'react'

const CalendarLayout = ({ children }: { children: ReactNode }) => {
  const { setTitle } = useGlobal()

  useEffect(() => {
    setTitle('Calendar')
  }, [])

  return (
    <Card className='overflow-visible'>
      <AppFullCalendar className='app-calendar'>{children}</AppFullCalendar>
    </Card>
  )
}

export default CalendarLayout
