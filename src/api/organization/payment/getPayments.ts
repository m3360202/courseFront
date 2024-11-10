import { Payment } from '@/types/organization/payment'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getPayments = (user: UserTable, organizationId: string) =>
  request(user).get<unknown, { data: Payment[] }>(`/user/getInstitutionPaymentHistory/${organizationId}`)
