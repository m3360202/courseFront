import { EnrollmentSigned } from '@/types/organization/enrollment/policy'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const saveSigned = (user: UserTable, params: EnrollmentSigned[]) =>
  request(user).post<unknown, { success: boolean }>(`/enrollmentPolicySigned/add`, { params })
