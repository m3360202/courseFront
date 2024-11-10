import type { PermissionIem } from '@/types/Permission'
import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export interface Permission {
  permissions: PermissionIem[]
}

export const getPermission = (user: UserTable) => request(user).get<unknown, { data: Permission }>(`/userRole/userRole`)
