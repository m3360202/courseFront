import request from '@/utils/request'

export interface InvitationCodeParams {
  invitationCode: string
}

export const verifyInvitationCode = (params: InvitationCodeParams) => {
  const payload = {
    ...params
  }

  return request.post<unknown, { data: any }>(`invitationCode/verifyInvitationCode`, payload)
}
