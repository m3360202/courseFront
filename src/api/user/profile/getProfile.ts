// Type Imports
import type { UserTable } from '@/types/user/UserTable'

import request from '@/utils/requestHasToken'

export const getProfile = (user: UserTable) =>
  request(user).get<unknown, { profile: UserTable }>(
    `/profile/${user?._id}`
  )

export const getUserProfile = (user: UserTable, userId: string) =>
  request(user).get<unknown, { profile: UserTable }>(
    `/profile/${userId}`
  )