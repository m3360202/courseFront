import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const addEnrollmentPolicy = (user: UserTable, policy: EnrollmentPolicy) =>
  request(user).post<unknown, { success: boolean }>(`enrollmentPolicy/add`, policy)

const editEnrollmentPolicy = (user: UserTable, policy: EnrollmentPolicy) =>
  request(user).put<unknown, { success: boolean }>(`enrollmentPolicy/update/${policy._id}`, policy)

export const saveEnrollmentPolicy = (user: UserTable, policy: EnrollmentPolicy) => {
  if (policy._id) return editEnrollmentPolicy(user, policy)
  else return addEnrollmentPolicy(user, policy)
}
