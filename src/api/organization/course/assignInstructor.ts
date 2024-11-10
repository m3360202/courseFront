import { Session } from '@/types/course/session'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const assignCourse = (user: UserTable, params: { courseId: string; userId: string; sessions?: Session[] }) =>
  request(user).put<unknown, { success: boolean }>(`/course/assignCourse`, {
    lessons: params.sessions,
    userId: params.userId,
    _id: params.courseId
  })
