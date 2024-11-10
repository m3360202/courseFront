import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const sendMail = (
  user: UserTable,
  params: { to: { userId: string; to: string }[] | undefined; title: string; message: string; instructorId?: string }
) => request(user).post<unknown, {}>(`/mail/sendMail`, { ...params })
