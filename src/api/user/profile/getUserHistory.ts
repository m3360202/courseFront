import request from '@/utils/requestHasToken'
import type { UserTable } from '@/types/user/UserTable'

export interface HistoryResponse {
  type: string
  title: string
  courseTitle: string
  date: string
  userName: string
  state: number
  openVideoDate?: string
  classDuration?: number
}

export const getUserHistory = (
  user: UserTable,
  userId: string,
  isStudentUser: boolean | undefined,
  instructorId?: string
) => {

  return request(user).get<unknown, { data: HistoryResponse[] }>(
    `history/${isStudentUser}/${userId}`,
    {
      params: { instructorId }
    }
  )
}
