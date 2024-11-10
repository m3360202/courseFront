import { ScheduleResult, TeachCourseResult } from '@/types/organization/schedule'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getSchedule = (user: UserTable, organizationId: string) =>
  request(user).get<unknown, { data: ScheduleResult }>(`schedule/load/${organizationId}`)

export const getTeachCourse = (user: UserTable, instructorId: string) =>
  request(user).get<unknown, { data: TeachCourseResult }>(`teachCourse/load/${instructorId}`)
