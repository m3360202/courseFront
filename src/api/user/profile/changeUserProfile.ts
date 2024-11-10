import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

interface responseData {
  userName?: string
  nickName?: string | undefined
  email?: string
  state?: string | undefined
  phone?: number | string | undefined
  fax?: string | undefined
  city?: string | undefined
  website?: string | undefined
  bio?: string | undefined
  timezone?: string
  userImg?: string
}
export const changeUserProfile = (user: UserTable, userId: string, data: responseData) =>
  request(user).post<unknown, UserTable>(`/user/change_user_profile`, {userId, data })
