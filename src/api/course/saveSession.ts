import { Session } from '@/types/course/session'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const addSession = async (user: UserTable, session: Session) => {
  return request(user).post<unknown, { success: boolean; message: string }>(`/course/lesson/add`, { ...session })
}

const editSession = (user: UserTable, session: Session) =>
  request(user).put<unknown, { success: boolean }>(`/course/lesson/update`, { ...session })

const saveSession = (user: UserTable, session: Session) =>
  session._id ? editSession(user, session) : addSession(user, session)

export default saveSession
