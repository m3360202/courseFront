// Third-party Imports
import type { EventInput } from '@fullcalendar/core'

// Type Imports
import type { ThemeColor } from '@core/types'

export type CalendarFiltersType = 'Session' | 'Assignment' | 'Quiz' | 'Survey' | 'Event'

export type CalendarColors = {
  Session: ThemeColor
  Assignment: ThemeColor
  Quiz: ThemeColor
  Survey: ThemeColor
  Event: ThemeColor
}

export type CalendarType = {
  events: EventInput[]
  filteredEvents: EventInput[]
  selectedEvent: null | any
  selectedCalendars: CalendarFiltersType[]
}

export type AddEventType = Omit<EventInput, 'id'>

export type SidebarLeftProps = {
  mdAbove: boolean
  calendarApi: any
  leftSidebarOpen: boolean
  calendarsColor: CalendarColors
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
}

export type AddEventSidebarType = {
  calendarApi: any
  addEventSidebarOpen: boolean
  handleAddEventSidebarToggle: () => void
}
