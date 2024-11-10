import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteEnrollment = (user: UserTable, id: string) =>
  request(user).put<unknown, { success: boolean }>(`/enrollmentPlan/delete/${id}`)
