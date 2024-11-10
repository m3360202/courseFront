import { FileType } from '@/types/file/file'
import { UploadFile } from '@/types/file/uploadFile'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const upload = (user: UserTable, file?: File) => {
  const formData = new FormData()
  formData.append('file', file as Blob)

  return request(user).post<unknown, UploadFile>(`/upload`, formData)
}

export const uploadMultiple = (user: UserTable, files?: File[]) => {
  const formData = new FormData()
  if (files) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      formData.append('files', file as Blob)
    }
  }

  return request(user).post<unknown, { data: FileType[] }>(`/upload/uploadMultipleFiles`, formData)
}
