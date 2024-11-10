import { Quiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getQuiz = (user: UserTable, courseId: string, quizId: string) =>
  request(user).get<unknown, { data: Quiz }>(`/course/quizdetail/${courseId}/${quizId}`)
