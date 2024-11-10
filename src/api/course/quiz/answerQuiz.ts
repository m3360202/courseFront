import { SubmitQuiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const answerQuiz = (user: UserTable, courseId: string, params: SubmitQuiz) =>
  request(user).post<unknown, { success: boolean; message: string }>(`/course/quizsubmit/add/${courseId}`, {
    ...params
  })

export default answerQuiz
