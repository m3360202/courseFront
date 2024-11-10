import { SubmitQuiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getSubmitQuiz = (user: UserTable, courseId: string,studentId:string, quizId: string) =>
  request(user).get<unknown, { data: SubmitQuiz }>(`/course/quizsubmit/${courseId}/${studentId}/${quizId}`)
