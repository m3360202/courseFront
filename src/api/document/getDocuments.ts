import { Document } from '@/types/document'
import { DocumentType } from '@/types/document'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const getDocuments = (user: UserTable, origin: DocumentType, originId: string, folderId?: string) =>
  request(user).get<unknown, { success: boolean; message: string; data: Document[] }>(`/folder/document/list`, {
    params: {
      folderId,
      origin,
      originId
    }
  })

export default getDocuments
