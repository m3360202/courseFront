import { Organization } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getOrganization = (user: UserTable, organizationId: string) =>
  request(user).get<unknown, { data: Organization }>(`institution/detail/${organizationId}`)
