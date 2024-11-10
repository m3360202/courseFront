// React Imports
import { useState, useEffect, forwardRef, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { AddEventSidebarType, AddEventType } from '@/types/apps/calendarTypes'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Context Imports
import { useCalendar } from '@/contexts/CalendarProvider/CalendarContext'
import { useParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@configs/i18n'
import { deleteCalendarEvent, saveCalendarEvent } from '@/api/calendar'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

interface DefaultStateType {
  url: string
  title: string
  allDay: boolean
  calendar: string
  description: string
  endDate: Date
  startDate: Date
  guests: string[] | undefined
}

// Vars
const capitalize = (string: string) => string && string[0].toUpperCase() + string.slice(1)

const defaultState: DefaultStateType = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  calendar: 'Event',
  startDate: new Date()
}

const AddEventSidebar = (props: AddEventSidebarType) => {
  // Props
  const { addEventSidebarOpen, handleAddEventSidebarToggle } = props

  // Context
  const { state: calendarStore, dispatch } = useCalendar()

  // States
  const [values, setValues] = useState<DefaultStateType>(defaultState)

  const isAddForm = !calendarStore.selectedEvent?.id
  const isEvent = calendarStore.selectedEvent?.extendedProps?.calendar === 'Event'
  const isViewMode = !isAddForm && !isEvent
  const user = useUser() as UserTable

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        className='is-full'
        error={props.error}
      />
    )
  })

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const { lang: locale } = useParams()

  const resetToStoredValues = useCallback(() => {
    if (calendarStore.selectedEvent !== null) {
      const event = calendarStore.selectedEvent

      setValue('title', event.title || '')
      setValues({
        url: event.url || '',
        title: event.title || '',
        allDay: event.allDay,
        guests: event.extendedProps.guests || [],
        description: event.extendedProps.description || '',
        calendar: event.extendedProps.calendar || 'Event',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? event.start : new Date()
      })
    }
  }, [setValue, calendarStore.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  const handleSidebarClose = () => {
    setValues(defaultState)
    clearErrors()
    dispatch({ type: 'SELECT_EVENT', payload: null })
    handleAddEventSidebarToggle()
  }

  const onSubmit = async (data: { title: string }) => {
    if (!user) return
    const modifiedEvent: AddEventType = {
      url: values.url,
      // display: 'block',
      title: data.title,
      end: values.endDate,
      allDay: values.allDay,
      start: values.startDate,
      extendedProps: {
        calendar: capitalize(values.calendar),
        // guests: values.guests && values.guests.length ? values.guests : undefined,
        description: values.description.length ? values.description : undefined
      }
    }

    try {
      if (isAddForm) {
        const response = await saveCalendarEvent(user, modifiedEvent)

        if (response.success) {
          dispatch({ type: 'ADD_EVENT', payload: { ...modifiedEvent, id: response.id } })
        }
      } else {
        const updatedEvent = { ...modifiedEvent, id: calendarStore.selectedEvent.id }

        const response = await saveCalendarEvent(user, updatedEvent)

        if (response.success) {
          dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent })
        }
      }

      dispatch({ type: 'FILTER_EVENTS' })

      handleSidebarClose()
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleDeleteButtonClick = async () => {
    if (calendarStore.selectedEvent) {
      try {
        const response = await deleteCalendarEvent(user, calendarStore.selectedEvent.id)

        if (response.success) {
          dispatch({ type: 'DELETE_EVENT', payload: calendarStore.selectedEvent.id })
          dispatch({ type: 'FILTER_EVENTS' })
        } else {
          console.error('Failed to delete the event')
        }
      } catch (error) {
        console.error('Error deleting the event:', error)
      }
    }

    handleSidebarClose()
  }

  const handleStartDate = (date: Date | null) => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const openDetailPage = () => {
    const selectedExtendedProps = calendarStore.selectedEvent?.extendedProps
    if (selectedExtendedProps) {
      const url = getLocalizedUrl(`/course/${selectedExtendedProps.courseId}/detail`, locale as Locale)
      window.open(url)
    }
  }

  const RenderSidebarFooter = () => {
    if (isAddForm) {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Add
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </div>
      )
    } else {
      if (isEvent) {
        return (
          <div className='flex gap-4'>
            <Button type='submit' variant='contained'>
              Update
            </Button>
            <Button variant='outlined' color='secondary' onClick={resetToStoredValues}>
              Reset
            </Button>
          </div>
        )
      } else {
        return (
          <div className='flex gap-4'>
            <Button type='button' variant='contained' onClick={openDetailPage}>
              Details
            </Button>
          </div>
        )
      }
    }
  }

  const ScrollWrapper = isBelowSmScreen ? 'div' : PerfectScrollbar

  useEffect(() => {
    if (calendarStore.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, calendarStore.selectedEvent])

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box className='flex justify-between items-center sidebar-header pli-5 plb-4 border-be'>
        <Typography variant='h5'>
          {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? 'Update Event' : 'Add Event'}
        </Typography>
        {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? (
          <Box className='flex items-center' sx={{ gap: calendarStore.selectedEvent !== null ? 1 : 0 }}>
            {isEvent && (
              <IconButton size='small' onClick={handleDeleteButtonClick}>
                <i className='ri-delete-bin-7-line text-2xl' />
              </IconButton>
            )}

            <IconButton size='small' onClick={handleSidebarClose}>
              <i className='ri-close-line text-2xl' />
            </IconButton>
          </Box>
        ) : (
          <IconButton size='small' onClick={handleSidebarClose}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        )}
      </Box>
      <ScrollWrapper
        {...(isBelowSmScreen
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true } })}
      >
        <Box className='sidebar-body plb-5 pli-6'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <FormControl fullWidth className='mbe-6'>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    InputProps={{
                      readOnly: isViewMode
                    }}
                    label='Title'
                    value={value}
                    onChange={onChange}
                    {...(errors.title && { error: true, helperText: 'This field is required' })}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth className='mbe-6'>
              <InputLabel id='event-calendar'>Calendar</InputLabel>
              <Select
                disabled={isViewMode}
                label='Calendar'
                value={values.calendar}
                labelId='event-calendar'
                onChange={e => setValues({ ...values, calendar: e.target.value })}
              >
                <MenuItem value='Session' disabled>
                  Session
                </MenuItem>
                <MenuItem value='Assignment' disabled>
                  Assignment
                </MenuItem>
                <MenuItem value='Quiz' disabled>
                  Quiz
                </MenuItem>
                <MenuItem value='Survey' disabled>
                  Survey
                </MenuItem>
                <MenuItem value='Event'>Event</MenuItem>
              </Select>
            </FormControl>
            <div className='mbe-6'>
              <AppReactDatepicker
                disabled={isViewMode}
                selectsStart
                id='event-start-date'
                endDate={values.endDate}
                selected={values.startDate}
                startDate={values.startDate}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='Start Date' registername='startDate' />}
                onChange={(date: Date | null) => date !== null && setValues({ ...values, startDate: new Date(date) })}
                onSelect={handleStartDate}
              />
            </div>
            <div className='mbe-6'>
              <AppReactDatepicker
                disabled={isViewMode}
                selectsEnd
                id='event-end-date'
                endDate={values.endDate}
                selected={values.endDate}
                minDate={values.startDate}
                startDate={values.startDate}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='End Date' registername='endDate' />}
                onChange={(date: Date | null) => date !== null && setValues({ ...values, endDate: new Date(date) })}
              />
            </div>
            <FormControl className='mbe-6'>
              <FormControlLabel
                label='All Day'
                control={
                  <Switch
                    disabled={isViewMode}
                    checked={values.allDay}
                    onChange={e => setValues({ ...values, allDay: e.target.checked })}
                  />
                }
              />
            </FormControl>
            <TextField
              InputProps={{
                readOnly: isViewMode
              }}
              rows={4}
              multiline
              fullWidth
              className='mbe-6'
              label='Description'
              id='event-description'
              value={values.description}
              onChange={e => setValues({ ...values, description: e.target.value })}
            />
            <div className='flex items-center'>
              <RenderSidebarFooter />
            </div>
          </form>
        </Box>
      </ScrollWrapper>
    </Drawer>
  )
}

export default AddEventSidebar
