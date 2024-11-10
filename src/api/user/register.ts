import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/request'
import moment from 'moment-timezone'

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export const register = (register: RegisterParams) =>
  request.post<unknown, UserTable>(`/auth/register`, { ...register, timeZone: moment.tz.guess() })
