import { Enrollment } from '@/types/organization/enrollment'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getEnrollments = (user: UserTable, organizationId: string) =>
  request(user).get<unknown, { data: Enrollment[] }>(`/enrollmentPlan/list/${organizationId}`)
