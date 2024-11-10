import { UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const addOrganizationUser = (
  user: UserTable,
  organizationId: string,
  userId: string,
  userType: UserType,
  role: number[],
  applyType?: number
) =>
  request(user).post<unknown, { success: boolean; message: string }>(`institution/addUser`, {
    id: organizationId,
    userId,
    userType,
    role,
    applyType
  })

export const pushOrganizationUser = (user: UserTable, organizationId: string, EnrollmentId: string) =>
  request(user).post<unknown, { success: boolean; message: string }>(
    `institution/pushUser/${organizationId}/${EnrollmentId}`
  )
