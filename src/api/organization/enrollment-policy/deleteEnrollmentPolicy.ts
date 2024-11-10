import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteEnrollmentPolicy = (user: UserTable, id: string) =>
  request(user).put<unknown, { success: boolean }>(`enrollmentPolicy/delete/${id}`)
