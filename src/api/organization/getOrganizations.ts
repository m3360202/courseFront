import { Organization } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getOrganizations = (user: UserTable) =>
  request(user).get<unknown, { data: Organization[] }>(`institution/userlist`)
