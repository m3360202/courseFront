import { Assignment } from '@/types/course/assignment'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const addAssignment = (user: UserTable, courseId: string, params: Assignment) =>
  request(user).post<unknown, { data: { success: boolean; message: string } }>(`/course/assignment/add/${courseId}`, {
    ...params
  })

export const editAssignment = (user: UserTable, courseId: string, params: Assignment) =>
  request(user).put<unknown, { data: { success: boolean; message: string } }>(
    `/course/assignment/update/${courseId}`,
    { ...params }
  )

const saveAssignment = async (user: UserTable, courseId: string, params: Assignment) => {
  if (params._id) return editAssignment(user, courseId, params)
  else return addAssignment(user, courseId, params)
}

export default saveAssignment
