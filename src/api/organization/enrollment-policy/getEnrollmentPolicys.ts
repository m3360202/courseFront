import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getEnrollmentPolicys = (user: UserTable, organizationId: string, isPublish?: boolean) =>
  request(user).get<unknown, { data: EnrollmentPolicy[] }>(`enrollmentPolicy/list/${organizationId}`, {
    params: { isPublish }
  })
