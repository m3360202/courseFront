import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteOrganizationUser = (user: UserTable, organizationId: string, userId: string) =>
  request(user).put<unknown, { success: boolean }>(`institution/deleteUser`, {
    id: organizationId,
    userId
  })
