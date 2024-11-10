import { UserTable } from '@/types/user/UserTable'

export type Payment = {
  _id: string
  updatedAt: string
  fee: number
  paymentMethodType: string
  userInfo: UserTable[]
  legalName: string
  status: string
  target: number
  pdfUrl: string
}
