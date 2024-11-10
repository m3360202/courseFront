import { Quiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getQuizs = (user: UserTable, courseId: string, filter: boolean, type?: string) =>
  request(user).get<unknown, { data: { quizs: Quiz[] } }>(`/course/quiz/${courseId}/${filter}/${type}`)
