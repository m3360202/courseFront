import { Course } from '@/types/course'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const addStudent = (user: UserTable, course: Course, students: { userId: string; code: string }[]) =>
  request(user).post<unknown, { success: boolean; message: string }>(`/course/pushStudents`, { course, students })
