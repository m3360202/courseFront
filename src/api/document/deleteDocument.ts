import { Document } from '@/types/document'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const deleteDocument = (user: UserTable, folderId: string, documentId: string) =>
  request(user).put<unknown, { success: boolean; message: string; data: Document[] }>(`/folder/delete`, {
    folderId,
    documentId
  })

export default deleteDocument
