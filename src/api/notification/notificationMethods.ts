import type { NotificationType } from '@/types/notification';
import type { UserTable } from '@/types/user/UserTable';
import request from '@/utils/requestHasToken'

export interface notificationDataType {
  userId: string,
  type: NotificationType,
  toUser: string,
  sourceId?: string,
  content?: string
}

export interface notificationResponseDataType {
  createdAt: string
  hasRed: boolean
  confirmed: boolean
  sender: {
    email: string
    nickName?: string
    userImg?: string
    username: string
    _id: string
  }
  sourceId: string
  sourceName: string
  source: any
  type: string
  userId: string
  _id: string
  content?: string
}

export const getNotifications = (user: UserTable, userId: string,) =>
  request(user).get<notificationResponseDataType[]>(`/notification/getNotifications/${userId}`)

export const readNotification = (
  user: UserTable,
  userId: string,
  readType: string,
  notificationId?: string
) =>
  request(user).put<unknown, { success: boolean; message: string; data: notificationDataType[] }>(`/notification/readNotifications`, {
    userId,
    notificationId,
    readType
  })

export const confirmNotification = (
  user: UserTable,
  userId: string,
  notificationId?: string
) =>
  request(user).put<unknown, { success: boolean; message: string; data: notificationDataType[] }>(`/notification/confirmNotifications`, {
    userId,
    notificationId
  })

export const deleteNotification = (user: UserTable, notificationId: string) =>
  request(user).put<unknown, { success: boolean; message: string; data: notificationDataType[] }>(`/notification/delete`, {
    notificationId
  })