import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const publishEnrollment = (user: UserTable, id: string, isPublish: boolean) =>
  request(user).post<unknown, { success: boolean }>(`/enrollmentPlan/publish`, { _id: id, isPublish })
