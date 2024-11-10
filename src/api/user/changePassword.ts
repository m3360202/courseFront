import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/request'

export const changePassword = (email: string, password: string, token: string) =>
  request.post<unknown, UserTable>(`/auth/change_password`, { email, password, token })
