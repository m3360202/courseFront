import request from '@/utils/request'

export const checkUserHasRegisted = (params: string) =>
  request.post<unknown, { message: any; state: number | void; data: any }>(`/auth/checkUserHasRegisted`, { params })

export const checkUserName = (params: string) =>
  request.post<unknown, { message: any; state: number | void }>(`/auth/checkUserName`, { params })

export const checkUserEmail = (params: string) =>
  request.post<unknown, { message: any; state: number | void }>(`/auth/checkUserEmail`, { params })

export const loginWithGoogleAccount = ( id: string, email: string, avatar: string, name: string) =>
  request.post<unknown, { message: any; state: number | void }>(`/auth/loginWithGoogleAccount`, {
    id,
    email,
    avatar,
    name
  })
