import { FileType } from '@/types/file/file'
import { Organization } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const saveOrganizationUser = (
  user: UserTable,
  userId: string,
  organizationId: string,
  resume?: FileType[],
  background?: FileType[]
) =>
  request(user).post<unknown, { data: Organization }>(`institution/saveDetail`, {
    userId,
    instructorId: organizationId,
    resume,
    background
  })
