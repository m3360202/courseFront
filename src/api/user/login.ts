import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/request'

export const login = (email: string, password: string) =>
  request.post<unknown, { data: UserTable; token: string }>(`/auth/login`, { email, password })
