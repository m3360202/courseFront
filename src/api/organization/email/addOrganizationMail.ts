import { OrganizationMail } from '@/types/organization/mail'
import { UserTable } from '@/types/user/UserTable'
import request from '@/utils/requestHasToken'

export const addMail = (
  user: UserTable,
  recipient: string[],
  title: string,
  message: string,
  messageObj: object,
  organizationId: string,
  folder?: string
) =>
  request(user).post<unknown, { data: OrganizationMail[] }>(`/mail/addMail`, {
    recipient,
    title,
    message,
    messageObj,
    instructorId: organizationId,
    folder
  })

export const editMail = (
  user: UserTable,
  id: string,
  recipient: string[],
  title: string,
  message: string,
  messageObj: object,
  folder?: string
) =>
  request(user).put<unknown, { data: OrganizationMail[] }>(`/mail/updateMail`, {
    _ids: [id],
    recipient,
    title,
    message,
    messageObj,
    folder
  })
