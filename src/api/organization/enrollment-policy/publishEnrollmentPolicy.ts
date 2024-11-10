import type { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const publishEnrollmentPolicy = (user: UserTable, id: string, isPublish: boolean) =>
  request(user).post<unknown, { success: boolean }>(`enrollmentPolicy/publish`, { _id: id, isPublish })
