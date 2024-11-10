import request from '@/utils/request';

export const getCaptcha = () =>
  request.get<unknown, { success: boolean; text: string; data: string }>(`/auth/getcaptcha`)
