import { Assignment } from '@/types/course/assignment'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getLibraryAssignment = (user: UserTable, organizationId: string, assignmentId: string) =>
  request(user).get<unknown, { data: Assignment }>(`/document/assignment/${organizationId}/${assignmentId}`)
