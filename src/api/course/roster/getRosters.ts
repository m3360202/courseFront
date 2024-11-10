import { Roster } from '@/types/course/roster'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getRosters = (user: UserTable, courseId: string, applyType: number) =>
  request(user).get<unknown, { data: Roster }>(`/course/inviteStudent/${courseId}`, {
    params: { applyType }
  })
