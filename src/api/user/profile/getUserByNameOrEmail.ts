import request from '@/utils/requestHasToken'
import type { UserTable } from '@/types/user/UserTable'

export const getUsersByNameOrEmail = (user: UserTable, params: { name?: string; email?: string }) => {
  return request(user).get<unknown, { data: UserTable }>(`/user/listByNameOrEmail`, {
    params
  })
}