import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const updateStudentScore = (
  user: UserTable,
  courseId: string,
  assignmentId: string,
  studentId: string,
  score: number
) =>
  request(user).put<unknown, { success: boolean; message: string }>(
    `/course/assignmentsubmit/${courseId}/${assignmentId}/${studentId}`,
    { score }
  )
