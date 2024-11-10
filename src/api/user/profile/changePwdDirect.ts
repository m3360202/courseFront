import request from '@/utils/requestHasToken'
import type { UserTable } from '@/types/user/UserTable'

export const changePasswordDirect = ({
  oldPassword,
  newPassword,
  user
}: {
  oldPassword: string
  newPassword: string
  user: UserTable
}) =>
  request(user).post<unknown, UserTable>(
    `/user/password`,
    { oldPassword, newPassword }
  )