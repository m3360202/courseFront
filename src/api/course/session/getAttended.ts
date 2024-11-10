import { Attended } from '@/types/course/session'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getAttended = (user: UserTable, userId: string, organizationId: string) =>
  request(user).get<unknown, { data: Array<Attended> }>(`/course/studentAttendedLessons/${userId}/${organizationId}`)
