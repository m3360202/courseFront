import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const updateGuardian = (
  user: UserTable,
  params: {
    _id: string,
    state: number
  }
) =>
  request(user).put<unknown, { success: boolean; message: string; }>(`/guradian/update`, { ...params })

export default updateGuardian
