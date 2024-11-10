import { UserTable } from '../user/UserTable'
import { Course } from '@/types/course'

export type Schedule = {
  weekName: string
  schedule: string[]
  scheduleDate?: Date[]
}

export type TeachCourse = {
  userId: string
  courseId: string
}

export type ScheduleResult = {
  instructorId: string
  userId: string
  schedules: Schedule[]
}

export interface TeachCourseResult {
  _id: string
  userId: UserTable
  courses: Course[]
}
