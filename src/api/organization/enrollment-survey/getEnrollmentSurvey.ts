import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getEnrollmentSurvey = (user: UserTable, id: string) =>
  request(user).get<unknown, { data: EnrollmentSurvey }>(`enrollmentSurvey/detail/${id}`)
