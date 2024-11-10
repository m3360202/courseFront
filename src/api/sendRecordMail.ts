import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const sendRecordMail = (user: UserTable, params: { to: string; title: string; message: string }) =>
  request(user).post<unknown, {}>(`/mail/sendRecordMail`, { ...params })
