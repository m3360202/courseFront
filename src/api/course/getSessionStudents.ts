import { Student } from '@/types/course/student'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getStudentList = (user: UserTable, courseId: string, lessonId: string, instructorIdOrUserId: string) =>
  request(user).get<
    unknown,
    {
      data: {
        id: string
        statusCountList: { _id: string; title: string; count: number }[]
        isManual: boolean
        students: Student[]
      }
    }
  >(`/course/lessonstudent/${courseId}/${lessonId}`, {
    params: { instructorIdOrUserId }
  })
