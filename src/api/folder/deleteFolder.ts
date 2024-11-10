import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const deleteFolder = (user: UserTable, folderId?: string) =>
  request(user).put<unknown, { success: boolean; message: string; }>(`/folder/delete/${folderId}`,{})

export default deleteFolder
