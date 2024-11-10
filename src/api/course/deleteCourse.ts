import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteCourse = (user: UserTable, courseId: string) =>
  request(user).delete<unknown, { success: boolean }>(`/course/delete/${courseId}`)
