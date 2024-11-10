import { EnrollmentAnswer } from '@/types/organization/enrollment/answer'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const saveEnrollmentAnswer = (user: UserTable, answer: EnrollmentAnswer) =>
  request(user).post<unknown, { success: boolean }>(`enrollmentSurveyAnswer/add`, answer)
