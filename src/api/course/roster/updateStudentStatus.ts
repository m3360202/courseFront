import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const updateStudentStatus = (user: UserTable, courseId: string, studentId: string, status: number) =>
  request(user).put<unknown, { success: boolean; message: string }>(`/course/updateStatus`, {
    courseId,
    studentId,
    status
  })
