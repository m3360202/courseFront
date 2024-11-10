import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const addFolderDocument = (user: UserTable, folderId: string, files?: File[]) => {
  const formData = new FormData()
  if (files) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      formData.append('files', file as Blob)
    }
  }

  return request(user).post<unknown, { success: boolean; message: string }>(`/folder/files`, formData, {
    params: { folderId }
  })
}

export default addFolderDocument
