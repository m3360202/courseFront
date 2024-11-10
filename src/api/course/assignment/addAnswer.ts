import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const addAnswer = (user: UserTable, courseId: string, assignmentId: string, files: File[]) => {
  const formData = new FormData()
  if (files) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      formData.append('files', file as Blob)
    }
  }

  return request(user).post<unknown, { success: boolean; message: string }>(
    `/course/assignment/answer/add/${courseId}/${assignmentId}`,
    formData
  )
}
