import { Folder } from '@/types/folder'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'
import { DocumentType } from '@/types/document'

const getFolders = (user: UserTable, origin: DocumentType, originId: string, folderId?: string) =>
  request(user).get<unknown, { success: boolean; message: string; data: Folder[] }>(`/folder/list`, {
    params: {
      folderId,
      origin,
      originId
    }
  })

export default getFolders
