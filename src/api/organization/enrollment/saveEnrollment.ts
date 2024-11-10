import { Enrollment } from '@/types/organization/enrollment'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const addEnrollment = (user: UserTable, enrollment: Enrollment) =>
  request(user).post<unknown, { success: boolean }>(`/enrollmentPlan/add`, enrollment)

export const editEnrollment = (user: UserTable, enrollment: Enrollment) =>
  request(user).put<unknown, { success: boolean }>(`/enrollmentPlan/update/${enrollment._id}`, enrollment)

const saveEnrollment = (user: UserTable, enrollment: Enrollment) => {
  if (enrollment._id) return editEnrollment(user, enrollment)
  else return addEnrollment(user, enrollment)
}

export default saveEnrollment
