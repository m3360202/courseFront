import { Folder } from '@/types/folder'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'
import { DocumentType } from '@/types/document'

const addFolder = (
  user: UserTable,
  name: string,
  origin: DocumentType,
  originId: string,
  parentId?: string
) =>
  request(user).post<unknown, { success: boolean; message: string; data: Folder }>(`/folder/create`, {
    name,
    parentId,
    origin,
    originId,
  })

const editFolder = (user: UserTable, folderId: string, name: string, parentId?: string) =>
  request(user).put<unknown, { success: boolean; message: string; data: Folder }>(`/folder/update/${folderId}`, {
    name,
    parentId
  })

const saveFolder = (
  user: UserTable,
  folderId: string | null,
  name: string,
  origin: DocumentType,
  originId: string,
  parentId?: string
) => {
  if (folderId) return editFolder(user, folderId, name, parentId)
  else return addFolder(user, name, origin, originId, parentId)
}

export default saveFolder
