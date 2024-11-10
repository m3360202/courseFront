import { Label } from '@/types/label'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const getLabels = (user: UserTable, id: string, all?: boolean) =>
  request(user).get<unknown, { data: Label[] }>(`/label/load/${id}/${all}`)
