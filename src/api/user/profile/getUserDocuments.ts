import request from '@/utils/requestHasToken'
import type { UserTable } from '@/types/user/UserTable'

export interface ResponseFileParams {
  _id: string
  temporary: string
  final: string
  isShow: boolean
  postedByUser: string
}

export const getUserDocuments = (
  user: UserTable,
  instructorId?: string
) => {

  return request(user).get<unknown, { data: [ResponseFileParams] }>(
    `/profile/userFiles/${user?._id}`,
    {
      params: { instructorId }
    }
  )
}
