'use client'

import type { ReactNode } from 'react'
import { useEffect, useLayoutEffect } from 'react'

import { useGlobal, useUser } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, usePathname } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import { useCourse } from '@/hooks/useCourse'
import getSourceUrl from '@/utils/getSourceUrl'

const CourseDetailLayout = ({ children }: { children: ReactNode }) => {
  //Hooks
  const { source, setBackUrl, setTitle } = useGlobal()
  const { lang: locale, courseId } = useParams()
  const { refreshCourse } = useCourse()
  const user = useUser()
  const pathName = usePathname()

  const loadCourse = async () => {
    if (user && courseId && refreshCourse && typeof refreshCourse === 'function') {
      await refreshCourse(user, courseId as string)
    }
  }

  useEffect(() => {
    loadCourse()
  }, [user, courseId, refreshCourse])

  useLayoutEffect(() => {
    setBackUrl([getLocalizedUrl(getSourceUrl(source) || '/course', locale as Locale)])
    setTitle('Course')

  }, [source, pathName])

  return <>{children}</>
}

export default CourseDetailLayout
