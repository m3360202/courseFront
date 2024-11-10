'use client'

import type { ReactNode } from 'react'
import { useGlobal } from '@/hooks/useGlobal'
import { useEffect } from 'react'

const CalendarLayout = ({ children }: { children: ReactNode }) => {
  const { setTitle } = useGlobal()

  useEffect(() => {
    setTitle('Search')
  }, [])

  return <>{children}</>
}

export default CalendarLayout
