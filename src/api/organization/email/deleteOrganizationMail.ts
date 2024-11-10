import { OrganizationMail } from '@/types/organization/mail'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const deleteMail = (user: UserTable, mailIds: string[]) =>
  request(user).put<unknown, { data: OrganizationMail[] }>(`/mail/deleteMail`, { _ids: mailIds })
