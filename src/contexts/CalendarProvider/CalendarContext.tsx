'use client'

import { createContext, useReducer, useContext, useEffect, useState } from 'react'
import type { EventInput } from '@fullcalendar/core'
// import { events as initialEvents } from '@/fake-db/apps/calendar'
import type { CalendarType, CalendarFiltersType } from '@/types/apps/calendarTypes'
import { getTodoList } from '@/api/calendar'
import { useStudent, useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { transformDateFromUTC } from '@/utils/date'
import { ToDoListResponse } from '@/types/calendar'
// const initialState: CalendarType = {
//   events: initialEvents,
//   filteredEvents: initialEvents,
//   selectedEvent: null,
//   selectedCalendars: ['Session', 'Assignment', 'Quiz', 'Survey', 'Event']
// }

const initialState: CalendarType = {
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  selectedCalendars: ['Session', 'Assignment', 'Quiz', 'Survey', 'Event']
}

const filterEventsUsingCheckbox = (events: EventInput[], selectedCalendars: CalendarFiltersType[]) => {
  return events.filter(event => selectedCalendars.includes(event.extendedProps?.calendar as CalendarFiltersType))
}

const SET_EVENTS = 'SET_EVENTS'
const ADD_EVENT = 'ADD_EVENT'
const UPDATE_EVENT = 'UPDATE_EVENT'
const DELETE_EVENT = 'DELETE_EVENT'
const SELECT_EVENT = 'SELECT_EVENT'
const FILTER_CALENDAR_LABEL = 'FILTER_CALENDAR_LABEL'
const FILTER_ALL_CALENDAR_LABELS = 'FILTER_ALL_CALENDAR_LABELS'

const calendarReducer = (state: CalendarType, action: any) => {
  switch (action.type) {
    case SET_EVENTS:
      return {
        ...state,
        events: action.payload,
        filteredEvents: action.payload
      }

    case ADD_EVENT:
      const newEvent = {
        ...action.payload
      }

      return {
        ...state,
        events: [...state.events, newEvent],
        filteredEvents: [...state.filteredEvents, newEvent]
      }

    case UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event => {
          if (event.id === action.payload.id) {
            return action.payload
          } else {
            return event
          }
        }),
        filteredEvents: state.filteredEvents.map(event => {
          if (event.id === action.payload.id) {
            return action.payload
          } else {
            return event
          }
        })
      }

    case DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        filteredEvents: state.filteredEvents.filter(event => event.id !== action.payload)
      }

    case SELECT_EVENT:
      return {
        ...state,
        selectedEvent: action.payload
      }

    case FILTER_CALENDAR_LABEL:
      const selectedCalendars = state.selectedCalendars.includes(action.payload)
        ? state.selectedCalendars.filter(calendar => calendar !== action.payload)
        : [...state.selectedCalendars, action.payload]

      return {
        ...state,
        selectedCalendars,
        filteredEvents: filterEventsUsingCheckbox(state.events, selectedCalendars)
      }

    case FILTER_ALL_CALENDAR_LABELS:
      const updatedCalendars: CalendarFiltersType[] = action.payload
        ? ['Session', 'Assignment', 'Quiz', 'Survey', 'Event']
        : []

      return {
        ...state,
        selectedCalendars: updatedCalendars,
        filteredEvents: filterEventsUsingCheckbox(state.events, updatedCalendars)
      }

    default:
      return state
  }
}

const CalendarContext = createContext<any>(null)

export const useCalendar = () => {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }

  return context
}

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(calendarReducer, initialState)
  const [loading, setLoading] = useState(false)
  const user = useUser() as UserTable
  const isStudent = useStudent()

  const handleFormatData = (data: ToDoListResponse[]) => {
    if (data && data.length > 0) {
      const result: ToDoListResponse[] = []
      data.map((item: ToDoListResponse) => {
        result.push(
          {
            ...item,
            title: item.extendedProps.title,
            start: transformDateFromUTC(item.start, user),
          }
        )
      })

      return result
    }

    return []

  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = {
        user,
        isStudent,
        type: 'Calendar',
        includedCalenderEvent: true
      }
      const { data } = await getTodoList(params)
      const formatData = handleFormatData(data)
      dispatch({ type: 'SET_EVENTS', payload: formatData })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  return <CalendarContext.Provider value={{ state, dispatch, loading }}>{children}</CalendarContext.Provider>
}
