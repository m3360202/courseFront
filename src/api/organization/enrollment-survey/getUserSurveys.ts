import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getUserSurveys = (user: UserTable, organizationId: string, userId: string, page: number, limit: number) =>
  request(user).get<unknown, { data: any }>(
    `/user/getSurveyListByUser/${limit}/${page * limit}/${organizationId}/${userId}`
  )
