import { Assignment } from '@/types/course/assignment'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getLibraryAssignments = (user: UserTable, organizationId: string) =>
  request(user).get<unknown, { data: { assignments: Assignment[] } }>(`/document/assignments/${organizationId}`)
