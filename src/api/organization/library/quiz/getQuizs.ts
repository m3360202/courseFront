import { Quiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getLibraryQuizs = (user: UserTable, organizationId: string) =>
  request(user).get<unknown, { data: { quizs: Quiz[] } }>(`/document/quizs/${organizationId}`)
