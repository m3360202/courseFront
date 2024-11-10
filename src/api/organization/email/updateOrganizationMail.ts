import { OrganizationMail } from '@/types/organization/mail'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const updateMail = (
  user: UserTable,
  mailIds: string[],
  folder?: string,
  isRead?: boolean,
  label?: string,
  isStarred?: boolean
) =>
  request(user).put<unknown, { data: OrganizationMail[] }>(`/mail/updateMail`, {
    _ids: mailIds,
    folder,
    isStarred,
    isRead,
    label
  })
