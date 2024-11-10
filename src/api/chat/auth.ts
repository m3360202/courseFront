import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const searchUsers = async (user: UserTable, id: any, userId: string) =>
  request(user).get(`user/searchUsers`, {
    params: {
      search: id,
      userId
    }
  })
