import { Enrollment } from '@/types/organization/enrollment'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getEnrollmentDetail = (user: UserTable, id: string) =>
  request(user).get<unknown, { data: Enrollment }>(`/enrollmentPlan/detail/${id}`)
