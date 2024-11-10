import { SubmitQuiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getSubmitStudents = (user: UserTable, courseId: string, quizId: string, querySubmit?: boolean) =>
  request(user).get<unknown, { data: SubmitQuiz[] }>(`/course/quizsubmit/${courseId}/${quizId}`, {
    params: { querySubmit: querySubmit || true }
  })
