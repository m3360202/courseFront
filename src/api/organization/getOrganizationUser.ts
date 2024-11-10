import { PlatformUser, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getOrganizationUsers = (
  user: UserTable,
  organizationId: string,
  userType: UserType,
  pageIndex: number,
  pageSize: number,
  searchValue?: string
) =>
  request(user).post<unknown, { data: { platformUsers: PlatformUser; total: number } }>(
    `institution/getUsers/${organizationId}/${userType}/${user._id}`,
    { pageIndex, pageSize, searchValue }
  )
