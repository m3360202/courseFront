import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const paymentCallback = (user: UserTable, orderId: string) =>
  request(user).post<unknown, { success: boolean; data: any }>(`/payment/paymentCallback`, {
    orderId
  })

export const addPaymentRecord = (user: UserTable, data: any) =>
  request(user).post<unknown, { success: boolean; }>(`/payment/createPaymentRecord`, {
    data
  })
