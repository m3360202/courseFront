import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const activeEnrollment = (user: UserTable, id: string) =>
  request(user).put<unknown, { success: boolean }>(`/enrollmentPlan/active/${id}`)

export const invalidEnrollment = (user: UserTable, id: string) =>
  request(user).put<unknown, { success: boolean }>(`/enrollmentPlan/invalid/${id}`)
