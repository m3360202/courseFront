import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const addEnrollmentSurvey = (user: UserTable, survey: EnrollmentSurvey) =>
  request(user).post<unknown, { success: boolean }>(`enrollmentSurvey/add`, survey)

const editEnrollmentSurvey = (user: UserTable, survey: EnrollmentSurvey) =>
  request(user).put<unknown, { success: boolean }>(`enrollmentSurvey/update/${survey._id}`, survey)

export const saveEnrollmentSurvey = (user: UserTable, survey: EnrollmentSurvey) => {
  if (survey._id) return editEnrollmentSurvey(user, survey)
  else return addEnrollmentSurvey(user, survey)
}
