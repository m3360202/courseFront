import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getEnrollmentPolicy = (user: UserTable, id: string) =>
  request(user).get<unknown, { data: EnrollmentPolicy }>(`enrollmentPolicy/detail/${id}`)
