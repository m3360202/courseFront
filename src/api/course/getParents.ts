import { GuradianParent } from '@/types/course/guradian'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getParents = (user: UserTable, userIds: string[]) =>
  request(user).post<unknown, { data: GuradianParent[] }>(`guradian/parents`, { userIds })
