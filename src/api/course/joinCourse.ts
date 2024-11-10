import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const joinCourse = (user: UserTable, params: { code: string; status?: number }) =>
  request(user).post<
    unknown,
    { success: boolean; message: string; instructorId: string; courseId: string; confirm: boolean }
  >(`/course/applyCourse`, { ...params })
