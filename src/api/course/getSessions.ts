import { Session } from '@/types/course/session'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getSessions = (
  user: UserTable,
  courseId: string,
  isArrange?: boolean | null,
  isInstitutionManager?: boolean,
  isTeacher?: boolean
) =>
  request(user).get<unknown, { data: Array<Session> }>(`/course/lesson/${courseId}`, {
    params: {
      isArrange,
      isInstitutionManager,
      isTeacher
    }
  })
