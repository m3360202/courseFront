import type { Course } from '@/types/course'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getCourses = (user: UserTable, instructorId?: string, arrangeType?: string, userId?: string) =>
  request(user).get<unknown, { data: Array<Course> }>(`/course/userCourses`, {
    params: { instructorId, arrangeType, userId }
  })
