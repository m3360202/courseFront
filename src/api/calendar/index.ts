import type { UserTable } from '@/types/user/UserTable'
import { ToDoListResponse } from '@/types/calendar'
import request from '@/utils/requestHasToken'
import { AddEventType } from '@/types/apps/calendarTypes'

interface GetTodoListParams {
  user: UserTable
  isStudent?: boolean
  date?: string
  type?: string
  includedCalenderEvent?: boolean
}

export const getTodoList = (params: GetTodoListParams) =>
  request(params.user).post<unknown, { data: Array<ToDoListResponse> }>(`/todo/list`, {
    isStudent: params.isStudent,
    date: params.date,
    type: params.type,
    userId: params.user._id,
    includedCalenderEvent: params.includedCalenderEvent
  })

export const saveCalendarEvent = (user: UserTable, eventData: AddEventType) =>
  request(user).post<unknown, { success: boolean; id: string }>(`/calender/save`, eventData)

export const deleteCalendarEvent = (user: UserTable, eventId: string) =>
  request(user).post<unknown, { success: boolean }>(`/calender/delete`, { id: eventId })
