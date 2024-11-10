import { useCallback, useEffect, useState } from 'react'

import CourseContext from './CourseContext'
import type { ArrangeType, Course } from '@/types/course'
import { getCourse } from '@/api/course/getCourse'
import { UserTable } from '@/types/user/UserTable'

interface Props {
  children?: React.ReactNode
}

export default function CourseProvider(props: Props) {
  const { children } = props
  const [userId, setUserId] = useState<string>()
  const [arrangeType, setArrangeType] = useState<ArrangeType>()
  const [course, setCourse] = useState<Course | null>(null)
  const [actionButtons, addActionButtons] = useState<JSX.Element[] | null>(null)
  const [courseId, setCourseId] = useState<string>('')
  const [isArrange, setIsArrange] = useState<boolean | null>(null)
  const [backUrl, setBackUrl] = useState<string[] | null>(null)
  const [loading, setLoading] = useState<boolean | null>(null)

  useEffect(() => {
    if (course) setCourseId(course._id)
  }, [course])

  const loadCourse = useCallback(async (user: UserTable | null, courseId: string) => {
    if (courseId) {
      setLoading(true)
      const { data } = await getCourse(user as UserTable, courseId as string)
      setCourse(data)
      setLoading(false)
    }
  }, [])

  const [refreshCourse, setRefreshCourse] = useState<(user: UserTable | null, courseId: string) => Promise<void>>(loadCourse)

  useEffect(() => {
    loadCourse && setRefreshCourse(() => loadCourse)
  }, [loadCourse])

  return (
    <CourseContext.Provider
      value={{
        userId,
        arrangeType,
        course,
        actionButtons,
        courseId,
        isArrange,
        backUrl,
        loading,
        refreshCourse,
        setUserId,
        setArrangeType,
        setCourse,
        addActionButtons,
        setIsArrange,
        setBackUrl,
        setLoading
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}
