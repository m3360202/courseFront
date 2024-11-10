import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/request'

export const forgotPassword = (email: string) => request.post<unknown, UserTable>(`/auth/forgot_password`, { email })
