import { Assignment } from '@/types/course/assignment'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getAssignments = (user: UserTable, courseId: string, filterUnPublish: boolean, type?: string) =>
  request(user).get<unknown, { data: { assignments: Assignment[] } }>(
    `/course/assignment/${courseId}/${filterUnPublish}/${type}`
  )
