import { Assignment } from '@/types/course/assignment'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getAssignment = (user: UserTable, courseId: string, assignmentId: string) =>
  request(user).get<unknown, { data: Assignment }>(`/course/assignmentDetail/${courseId}/${assignmentId}`)
