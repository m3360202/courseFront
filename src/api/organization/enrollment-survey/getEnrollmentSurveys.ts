import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getEnrollmentSurveys = (user: UserTable, organizationId: string, isPublish?: boolean) =>
  request(user).get<unknown, { data: EnrollmentSurvey[] }>(`enrollmentSurvey/list/${organizationId}`, {
    params: { isPublish }
  })

export const getEnrollmentAnswers = (user: UserTable, organizationId: string, users: string[]) =>
  request(user).post<unknown, { data: any }>(`institution/enrollmentSurveys`, { id: organizationId, users })
