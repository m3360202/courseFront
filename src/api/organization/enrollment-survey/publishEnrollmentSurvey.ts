import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const publishEnrollmentSurvey = (user: UserTable, id: string, isPublish: boolean) =>
  request(user).post<unknown, { success: boolean }>(`enrollmentSurvey/publish`, { _id: id, isPublish })
