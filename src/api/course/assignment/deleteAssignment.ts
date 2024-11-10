import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteAssignment = (user: UserTable, courseId: string, assignmentId: string) =>
  request(user).delete<unknown, {success: boolean; message: string  }>(`/course/assignment/delete/${courseId}/${assignmentId}`)
