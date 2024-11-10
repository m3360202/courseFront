import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const updateInstitutionUser = (
  user: UserTable,
  params: { id: string; studentId: string; state: number }
) =>
  request(user).put<unknown, { result: boolean }>(`/institution/updateUser`, {
    ...params
  })
