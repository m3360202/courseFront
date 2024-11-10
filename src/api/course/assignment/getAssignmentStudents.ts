import { Student } from '@/types/course/student'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getStudentList = (user: UserTable, courseId: string, assignmentId: string) =>
  request(user).get<
    unknown,
    {
      data: {
        students: Student[]
      }
    }
  >(`/course/assignmentsubmit/${courseId}/${assignmentId}`)
