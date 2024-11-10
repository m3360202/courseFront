import { createContext } from 'react'

import type { ArrangeType, Course } from '@/types/course'
import { UserTable } from '@/types/user/UserTable'

export interface CourseContextInterface {
  arrangeType?: ArrangeType
  userId?: string
  course: Course | null
  courseId: string
  isArrange: boolean | null
  actionButtons: JSX.Element[] | null
  backUrl: string[] | null
  loading: boolean | null
  refreshCourse: (user: UserTable | null, courseId: string) => Promise<void>

  setArrangeType: (arrangeType: ArrangeType | undefined) => void
  setUserId: (userId: string | undefined) => void
  setCourse: (course: Course | null) => void
  addActionButtons: (buttons: JSX.Element[] | null) => void
  setIsArrange: (course: boolean | null) => void
  setBackUrl: (backUrl: string[] | null) => void
  setLoading: (loading: boolean | null) => void
}

const CourseContext = createContext<CourseContextInterface | null>(null)

export default CourseContext
