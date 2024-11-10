import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const deleteDocumentUnderFolder = (user: UserTable, folderId?: string, documentId?: string) =>
  request(user).put<unknown, { success: boolean; message: string; }>(`/folder/delete/${folderId}/${documentId}`,{})

export default deleteDocumentUnderFolder
