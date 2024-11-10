import request from '@/utils/requestHasToken'
import type { UserTable } from '@/types/user/UserTable'

export interface GuradianParams {
  userId: string
  childId: string
  childCode: string
  state: number
}

export interface GuradianResponse {
  _id: string
  name: string
  userImg: string
  email: string
  userId: string
  userCode: string
  childName: string
  childUserImg: string
  childEmail: string
  childId: string
  childCode: string
  state: number
}

export interface GuradianParent {
  userId: UserTable
}

export const addGuradian = (user: UserTable, param: GuradianParams) => {
  return request(user).post<unknown, { success: boolean }>(
    `guradian/add`,
    { ...param }
  )
}

export const deleteGuradian = (user: UserTable, id: string) => {
  return request(user).put<unknown, { success: boolean }>(`guradian/delete/${id}`, null)
}

export const getGuradians = (user: UserTable, isStudent: boolean, userId?: string) => {
  return request(user).get<unknown, { data: GuradianResponse[] }>(`guradian/list/${isStudent}`, {
    params: { userId }
  })
}