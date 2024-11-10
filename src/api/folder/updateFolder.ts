import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const updateFolder = (
  user: UserTable,
  id: string,
  params: {
    name?: string
    parentId?: string | null
    id?: string
  }
) =>
  request(user).put<unknown, { success: boolean; message: string; }>(`/folder/update/${id}`, { ...params })

export default updateFolder
