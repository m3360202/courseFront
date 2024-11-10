import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteEnrollmentSurvey = (user: UserTable, id: string) =>
  request(user).put<unknown, { success: boolean }>(`enrollmentSurvey/delete/${id}`)
