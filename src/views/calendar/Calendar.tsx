// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party imports
import 'bootstrap-icons/font/bootstrap-icons.css'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions } from '@fullcalendar/core'

// Type Imports
import type { AddEventType, CalendarColors } from '@/types/apps/calendarTypes'

// Context Imports
import { useCalendar } from '@/contexts/CalendarProvider/CalendarContext'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

type CalendarProps = {
  calendarApi: any
  setCalendarApi: (val: any) => void
  calendarsColor: CalendarColors
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
}

const blankEvent: AddEventType = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    description: ''
  }
}

const Calendar = (props: CalendarProps) => {
  // Props
  const { calendarApi, setCalendarApi, calendarsColor, handleAddEventSidebarToggle, handleLeftSidebarToggle } = props

  // Refs
  const calendarRef = useRef()

  // Hooks
  const theme = useTheme()
  const { state: calendarStore, dispatch, loading } = useCalendar()

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calendar options (Props)
  const calendarOptions: CalendarOptions = {
    events: calendarStore.filteredEvents,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev, next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },

    /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
    // editable: true,

    /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
    eventResizableFromStart: true,

    /*
      Automatically scroll the scroll-containers during event drag-and-drop and date selecting
      ? Docs: https://fullcalendar.io/docs/dragScroll
    */
    dragScroll: true,

    /*
      Max number of events within a given day
      ? Docs: https://fullcalendar.io/docs/dayMaxEvents
    */
    dayMaxEvents: 2,

    /*
      Determines if day names and week names are clickable
      ? Docs: https://fullcalendar.io/docs/navLinks
    */
    navLinks: true,

    eventDisplay: 'block',
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      meridiem: false, // 设置为 false 以隐藏 am/pm
    },
    eventClassNames({ event: calendarEvent }: any) {
      // @ts-ignore
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

      return [
        // Background Color
        `event-bg-${colorName}`
      ]
    },
    datesSet() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();

      const cells = document.querySelectorAll('.fc-day');

      cells.forEach((cell) => {
        const dateStr = cell.getAttribute('data-date');
        if (dateStr) {
          const date = new Date(dateStr);
          date.setHours(0, 0, 0, 0); // 确保时间部分为零
          const dateTimestamp = date.getTime();
          if (dateTimestamp === todayTimestamp) {
            (cell as HTMLElement).style.backgroundColor = 'rgba(32, 159, 29, 0.1)'; // 设置背景颜色
          }
        }
      });
    },
    eventClick({ event: clickedEvent, jsEvent }: any) {
      jsEvent.preventDefault()

      dispatch({ type: 'SELECT_EVENT', payload: clickedEvent })
      handleAddEventSidebarToggle()

      if (clickedEvent.url) {
        // Open the URL in a new tab
        window.open(clickedEvent.url, '_blank')
      }

      //* Only grab required field otherwise it goes in infinity loop
      //! Always grab all fields rendered by form (even if it get `undefined`)
      // event.value = grabEventDataFromEventApi(clickedEvent)
      // isAddNewEventSidebarActive.value = true
    },

    customButtons: {
      sidebarToggle: {
        icon: 'bi bi-list',
        click() {
          handleLeftSidebarToggle()
        }
      }
    },

    dateClick(info: any) {
      const ev = { ...blankEvent }

      ev.start = info.date
      ev.end = info.date
      ev.allDay = true

      dispatch({ type: 'SELECT_EVENT', payload: ev })
      handleAddEventSidebarToggle()
    },

    /*
      Handle event drop (Also include dragged event)
      ? Docs: https://fullcalendar.io/docs/eventDrop
      ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
    */
    eventDrop({ event: droppedEvent }: any) {
      dispatch({ type: 'UPDATE_EVENT', payload: droppedEvent })
      dispatch({ type: 'FILTER_EVENTS' })
    },

    /*
      Handle event resize
      ? Docs: https://fullcalendar.io/docs/eventResize
    */
    eventResize({ event: resizedEvent }: any) {
      dispatch({ type: 'UPDATE_EVENT', payload: resizedEvent })
      dispatch({ type: 'FILTER_EVENTS' })
    },

    // @ts-ignore
    ref: calendarRef,

    direction: theme.direction,

    eventMouseEnter({ el }) {
      el.style.cursor = 'pointer'
    },
    eventMouseLeave({ el }) {
      el.style.cursor = ''
    }
  }

  return (
    <>
      <Backdrop open={loading} style={{ zIndex: 1300 }} invisible={false}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <FullCalendar {...calendarOptions} />
    </>
  )
}

export default Calendar
