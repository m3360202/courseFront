import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const deleteLibraryQuiz = (user: UserTable, organizationId: string, quizId: string) =>
  request(user).delete<unknown, { success: boolean; message: string }>(
    `/document/quiz/delete/${organizationId}/${quizId}`
  )

export default deleteLibraryQuiz
