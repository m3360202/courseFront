import { Session } from '@/types/course/session'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getNextSession = (user: UserTable, courseId: string) =>
  request(user).get<unknown, { data: Session }>(`/course/nextLesson/${courseId}`)
