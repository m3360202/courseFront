import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteSession = (user: UserTable, courseId: string, sessionId: string) =>
  request(user).delete<unknown, { success: boolean }>(`/course/lesson/delete`, {
    params: {
      courseId,
      _id: sessionId
    }
  })
