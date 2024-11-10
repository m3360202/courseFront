import { Session } from '@/types/course/session'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getSession = (user: UserTable, courseId: string, sessionId?: string) =>
  request(user).get<unknown, { data: Session }>(`/course/lesson/${courseId}/${sessionId}`)
