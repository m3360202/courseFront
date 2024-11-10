import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteLibraryAssignment = (user: UserTable, organizationId: string, assignmentId: string) =>
  request(user).delete<unknown, { success: boolean; message: string }>(
    `/document/assignment/delete/${organizationId}/${assignmentId}`
  )
