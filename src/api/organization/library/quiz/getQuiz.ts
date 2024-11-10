import { Quiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getLibraryQuiz = (user: UserTable, organizationId: string, quizId: string) =>
  request(user).get<unknown, { data: Quiz }>(`/document/quiz/${organizationId}/${quizId}`)
