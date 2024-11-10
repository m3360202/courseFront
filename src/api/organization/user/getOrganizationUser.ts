import { OrganizationUser } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getOrganizationUser = (user: UserTable, organizationId: string, userId: string) =>
  request(user).get<unknown, { data: OrganizationUser }>(
    `institution/userDetail/${userId}/${organizationId}/${user._id}`
  )
