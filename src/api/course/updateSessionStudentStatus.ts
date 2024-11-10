import { Student } from '@/types/course/student'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const updateSessionStudentStatus = (
  user: UserTable,
  courseId: string,
  sessionId: string,
  sessionStudent: Student
) =>
  request(user).put<unknown, { result: boolean }>(`/course/lessonstudent/${courseId}/${sessionId}`, {
    ...sessionStudent
  })
