import request from '@/utils/requestHasToken'
import type { UserTable } from '@/types/user/UserTable'

export const getUserPaymentHistory = (
  user: UserTable,
  {
    userId,
    page = 0,
    limit = 10
  }: {
    userId: string
    page: number
    limit: number
  }
) => {
  const start = page * limit

  return request(user).get(`/user/getMyPaymentHistory/${limit}/${start}/${userId}`)
    .then((response:any) => {
      return response.data
    })
    .catch((error: any) => {
      console.error(error)
      throw error
    })
}
