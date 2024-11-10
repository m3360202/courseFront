export interface ToDoListResponse {
  id: string
  url: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  extendedProps: {
    calendar: string
    item: any
    courseId: string
    title: string
  }
}
