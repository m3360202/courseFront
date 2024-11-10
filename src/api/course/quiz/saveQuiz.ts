import { Quiz } from '@/types/course/quiz'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

const addQuiz = (user: UserTable, courseId: string, params: Quiz) =>
  request(user).post<unknown, { success: boolean; message: string }>(`/course/quiz/add/${courseId}`, { ...params })

const editQuiz = (user: UserTable, courseId: string, params: Quiz) =>
  request(user).put<unknown, { success: boolean; message: string }>(`/course/quiz/update/${courseId}`, { ...params })

const saveQuiz = (user: UserTable, courseId: string, params: Quiz) => {
  if (params._id) return editQuiz(user, courseId, params)
  else return addQuiz(user, courseId, params)
}

export default saveQuiz
