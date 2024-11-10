import { Course } from '@/types/course'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getCourse = (user: UserTable, courseId: string) =>
  request(user).get<unknown, { data: Course }>(`/course/${courseId}`, { params: { userId: user?._id } })
