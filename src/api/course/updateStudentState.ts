import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const updateStudentState = (
  user: UserTable,
  params: { courseId: string; studentId: string; status: number }
) =>
  request(user).put<unknown, { result: boolean }>(`/course/updateStatus`, {
    ...params
  })
