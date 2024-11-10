import { Schedule } from '@/types/organization/schedule'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const saveSchedule = (user: UserTable, params: { instructorId: string; schedules: Schedule[] }) =>
  request(user).post<unknown, { success: boolean }>(`schedule/save/${params.instructorId}`, {
    ...params,
    userId: user._id
  })

export const saveTeachCourse = (user: UserTable, params: { instructorId: string; courses: string[] }) =>
  request(user).post<unknown, { success: boolean }>(`teachCourse/save/${params.instructorId}`, {
    ...params,
    userId: user._id
  })
