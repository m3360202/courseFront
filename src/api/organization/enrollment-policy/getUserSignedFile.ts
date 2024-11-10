import { EnrollmentSigned } from '@/types/organization/enrollment/policy'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getUserSignedFile = (user: UserTable, organizationId: string, userId: string) =>
  request(user).get<unknown, { data: EnrollmentSigned[] }>(
    `/enrollmentPolicySigned/userSignedFile/${organizationId}/${userId}`
  )
