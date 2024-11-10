import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/request'

export const checkCode = (email: string, token: string) =>
  request.post<unknown, UserTable>(`/auth/check_token`, { email, token })
