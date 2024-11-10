import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const unRegister = (user: UserTable, courseId: string, studentId: string, changeState?: boolean) =>
  request(user).put<unknown, { success: boolean; message: string }>(`/course/unRegister`, {
    courseId,
    studentId,
    changeState
  })
