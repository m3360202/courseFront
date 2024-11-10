import type { Label } from '@/types/label'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const saveLabel = (user: UserTable, params: Label) =>
  request(user).post<unknown, { success: boolean }>(`/label/save`, { ...params })
