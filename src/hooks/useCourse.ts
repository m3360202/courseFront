import { useContext } from 'react'

import type { CourseContextInterface } from '@/contexts/CourseProvider/CourseContext'
import CourseContext from '@/contexts/CourseProvider/CourseContext'
import { useStudent, useUser } from './useGlobal'
import { StudentStatus } from '@/types/course/student'

export const useCourse = (): CourseContextInterface => {
  const context = useContext(CourseContext)

  if (!context) {
    throw new Error('content must be used within a SettingsProvider')
  }

  return context
}

export const useAccessCourseDenied = () => {
  const { course } = useCourse()
  const user = useUser()

  if (useStudent() && course?.students?.find(c => c.userId === user?._id)?.status === StudentStatus.Active) return true
  else return false
}

export const useEditCourseRole = () => {
  const { course } = useCourse()
  if (course?.isEdit) return true
  else return false
}
