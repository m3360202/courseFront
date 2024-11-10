import type { UserTable } from '../user/UserTable'

export interface Session {
  _id: string
  courseId: string
  name: string
  lessonDate: Date | string
  lessonStartTime: Date | string
  lessonDuration: number
  description: string
  descriptionObj: any
  offline?: boolean
  finished?: boolean
  timeZone?: string
  arrangeUser?: UserTable
  recording: Array<{ url: string }>
}

export type Attended = {
  courseId: string
  lessonId: string
  courseTitle: string
  lessonDate: Date
  lessonTitle: string
  status: string
  statusTitle: string
}
