import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const deleteQuiz = (user: UserTable, courseId: string, quizId: string) =>
  request(user).delete<unknown, { success: boolean; message: string }>(`/course/quiz/delete/${courseId}/${quizId}`)

export default deleteQuiz
