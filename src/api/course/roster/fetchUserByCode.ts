import request from '@/utils/request'

export const fetchUserByCode = (code: string) => {
  return request.get<unknown, { data: any }>(`user/getUsersByCode/${code}`, {
  })
}
