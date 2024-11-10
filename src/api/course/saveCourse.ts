import type { Course } from '@/types/course'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'
import { error } from '@/utils/toasts'

const addCourse = async (user: UserTable, course: Course) => {
  if (!user?.timeZone) return error('Timezone empty!')

  return request(user).post<unknown, { success: boolean }>(`/course/add`, { ...course })
}

const editCourse = (user: UserTable, course: Course) =>
  request(user).put<unknown, { success: boolean }>(`/course/update`, { ...course })

const saveCourse = (user: UserTable, course: Course) =>
  course._id ? editCourse(user, course) : addCourse(user, course)

export default saveCourse
