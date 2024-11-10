'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { array, boolean, date, minValue, nonEmpty, number, object, optional, pipe, string } from 'valibot'

import { Box, Card, Chip, FormControlLabel, InputAdornment, Switch } from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import Title from '@/components/title'
import { useDictionary } from '@/hooks/useDictionary'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import type { Label } from '@/types/label'
import { Tag } from '@/components/label'
import type { Course } from '@/types/course'
import { joinTypes } from '@/types/course'
import type { Locale } from '@/configs/i18n'
import { CustomDivider } from '@/components/divider'
import { WEEKNAME } from '@/types'
import AddressInput from '@/components/address-input'

import saveCourse from '@/api/course/saveCourse'
import type { UserTable } from '@/types/user/UserTable'
import { transformLocalDateZoneToUTC, transformDateFromUTC } from '@/utils/date'
import { RequiredStar } from '@/components/form-field'
import { getCourse } from '@/api/course/getCourse'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { success } from '@/utils/toasts'
import { delay } from 'lodash'
import { getLocalizedUrl } from '@/utils/i18n'
import FormLayout from '@/components/layout/FormLayout'

const SaveCourse = ({ courseId, organizationId }: { courseId?: string; organizationId?: string }) => {
  //States
  const [labels, setLabels] = useState<Label[] | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale } = useParams()
  const { push } = useRouter()
  const { addTopButtons, setBackUrl, setHiddenTabs, setTitle } = useGlobal()

  //Vars

  const loadCourse = async () => {
    const { data } = await getCourse(user as UserTable, courseId as string)
    if (data) {
      const keys = Object.keys(data) as Array<keyof Course>
      keys.map(key => {
        switch (key) {
          case 'startTime':
          case 'endTime':
          case 'lessonStartTime':
          case 'deadline':
            setValue(key, transformDateFromUTC(data[key] as Date, user))
            break
          default:
            setValue(key, data[key])
            break
        }
      })
    }
  }

  useEffect(() => {
    if (user && courseId) loadCourse()
  }, [user, courseId])

  useEffect(() => {
    setBackUrl([getLocalizedUrl(courseId ? `/course/${courseId}/detail` : '/course', locale as Locale)])
    setHiddenTabs(true)
    setTitle(courseId ? 'Edit course' : 'Add course')

    return () => {
      //setBackUrl(null)
      setHiddenTabs(false)
    }
  }, [courseId])



  //vars
  const joinCourseType = joinTypes(locale as Locale)

  const schema = object({
    title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    startTime: date(dictionary.common.fieldRequired),
    endTime: date(dictionary.common.fieldRequired),
    lessonStartTime: date(dictionary.common.fieldRequired),
    capacity: pipe(number(dictionary.common.fieldRequired), minValue(1, dictionary.common.fieldRequired)),
    lessonDuration: pipe(number(dictionary.common.fieldRequired), minValue(1, dictionary.common.fieldRequired)),
    joinType: number(dictionary.common.fieldRequired),
    isPrivate: number(dictionary.common.fieldRequired),
    timetable: pipe(array(number(dictionary.common.fieldRequired)), nonEmpty(dictionary.common.fieldRequired)),
    offline: optional(boolean(dictionary.common.fieldRequired)),
    deadline: optional(date(dictionary.common.fieldRequired)),
    address: optional(string(dictionary.common.fieldRequired)),
    classroom: optional(string(dictionary.common.fieldRequired))
  })

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid }
  } = useForm<Course>({
    defaultValues: {
      timetable: []
    },
    resolver: valibotResolver(schema)
  })



  useEffect(() => {
    user && addTopButtons([
      <LoadingButton key={isValid ? 'valid' : 'invalid'} variant='contained' onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])

    return () => {
      addTopButtons(null)
    }
  }, [isValid, user])

  const joinType = watch('joinType')
  const deadline = watch('deadline')
  const offline = watch('offline')
  const address = watch('address')
  const classroom = watch('classroom')
  const isPrivate = watch('isPrivate')
  const startTime = watch('startTime')



  const joinTypeTip = () => {
    switch (joinType) {
      case 0:
        return dictionary.course.approvalTip
      case 1:
        return dictionary.course.autoJoinTip
      default:
        return ''
    }
  }

  const privateTip = () => {
    switch (isPrivate) {
      case 0:
        return dictionary.course.privateTip
      case 1:
        return dictionary.course.publicTip
      default:
        return ''
    }
  }

  useEffect(() => {
    if (joinType === 2 && !deadline)
      setError('deadline', {
        type: 'manual',
        message: dictionary.common.fieldRequired
      })
    else errors.deadline = undefined
  }, [joinType, deadline])

  useEffect(() => {
    if (offline === true) {
      if (!address)
        setError('address', {
          type: 'manual',
          message: dictionary.common.fieldRequired
        })
      else errors.address = undefined
      if (!classroom)
        setError('classroom', {
          type: 'manual',
          message: dictionary.common.fieldRequired
        })
      else errors.classroom = undefined
    }
  }, [offline, address, classroom])

  const onSubmit = async (data: Course) => {
    try {

      setSaveLoading(true)
      const endTime = new Date(data.endTime)
      endTime.setHours(23)
      endTime.setMinutes(59)
      endTime.setSeconds(59)
      data._id = courseId as string
      data.startTime = transformLocalDateZoneToUTC(data.startTime, user)
      data.endTime = transformLocalDateZoneToUTC(endTime, user)
      data.lessonStartTime = transformLocalDateZoneToUTC(data.lessonStartTime, user)

      if (data.deadline) {
        data.deadline = transformLocalDateZoneToUTC(data.deadline, user)
      }

      data.labels = labels
      data.instructorId = organizationId
      await saveCourse(user as UserTable, data)
      success(
        `${courseId ? dictionary.common.edit : dictionary.common.add} ${dictionary.course.course} ${dictionary.common.successful}`
      )
      delay(() => push(getLocalizedUrl(`/course`, locale as Locale)), 500)
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <FormLayout>
      <Card>
        <div className='p-5'>
          <div className='flex flex-col gap-5'>
            <CustomDivider>
              <Title variant='h5'>{`${dictionary.course.course} ${dictionary.common.setting}`}</Title>
            </CustomDivider>

            <Controller
              name='title'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={field.onChange}
                  fullWidth
                  label='Title'
                  placeholder=''
                  {...(errors.title && {
                    error: true,
                    helperText: errors?.title?.message
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                  }}
                />
              )}
            />
            <div className='flex gap-1 w-full'>
              <div className=' w-1/2'>
                <Controller
                  name='startTime'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AppReactDatepicker
                      selected={field.value as Date}
                      onChange={date => {
                        setValue('startTime', date as Date)
                        setValue('endTime', '')
                      }}
                      placeholderText='MM/DD/YYYY'
                      customInput={
                        <TextField
                          fullWidth
                          label='StartDate'
                          InputProps={{
                            startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                          }}
                          {...(errors.startTime && {
                            error: true,
                            helperText: errors?.startTime?.message
                          })}
                        />
                      }
                    />
                  )}
                />
              </div>
              <div className=' w-1/2'>
                <Controller
                  name='endTime'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AppReactDatepicker
                      selected={field.value as Date}
                      onChange={date => {
                        setValue('endTime', date as Date)
                      }}
                      placeholderText='MM/DD/YYYY'
                      minDate={new Date(startTime || new Date())}
                      customInput={
                        <TextField
                          fullWidth
                          label='EndtDate'
                          {...(errors.endTime && {
                            error: true,
                            helperText: errors?.endTime?.message
                          })}
                          InputProps={{
                            startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                          }}
                        />
                      }
                    />
                  )}
                />
              </div>
            </div>
            <Controller
              name='capacity'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Capacity'
                  type='number'
                  inputProps={{ min: 1 }}
                  onChange={event => {
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }}
                  {...(errors.capacity && {
                    error: true,
                    helperText: errors?.capacity?.message
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                  }}
                />
              )}
            />
            <CustomDivider>
              <Title variant='h5'>{`${dictionary.course.session} ${dictionary.common.setting}`}</Title>
            </CustomDivider>
            <FormControl fullWidth>
              <InputLabel id='schedule' error={Boolean(errors.timetable)}>
                {`${dictionary.course.session} ${dictionary.common.schedule}`}
              </InputLabel>
              <Controller
                name='timetable'
                control={control}
                render={({ field }) => (
                  <Select
                    multiple
                    label={`${dictionary.course.session} ${dictionary.common.schedule}`}
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    renderValue={selected => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {(selected as unknown as number[]).map(
                          (value: number) =>
                            WEEKNAME[value] && <Chip key={value} label={WEEKNAME[value]} sx={{ margin: 0.75 }} />
                        )}
                      </Box>
                    )}
                    error={Boolean(errors.timetable)}
                    onChange={e => {
                      const schedules = (e.target.value as number[]).sort((a, b) => a - b)

                      setValue('timetable', schedules)
                    }}
                  >
                    {WEEKNAME.map((name, index) => (
                      <MenuItem key={name} value={index}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.timetable && <FormHelperText error>{dictionary.common.fieldRequired}</FormHelperText>}
            </FormControl>
            <Controller
              name='lessonStartTime'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <AppReactDatepicker
                  selected={field.value as Date}
                  onChange={date => {
                    setValue('lessonStartTime', date as Date)
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  placeholderText='hh:mm'
                  dateFormat='h:mm aa'
                  customInput={
                    <TextField
                      fullWidth
                      label={dictionary.course.sessionStartTime}
                      {...(errors.lessonStartTime && {
                        error: true,
                        helperText: errors?.lessonStartTime?.message
                      })}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='lessonDuration'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={dictionary.course.sessionLength}
                  type='number'
                  inputProps={{ min: 1 }}
                  placeholder=''
                  {...(errors.lessonDuration && {
                    error: true,
                    helperText: errors?.lessonDuration?.message
                  })}
                  onChange={event => {
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box display='flex' alignItems='center'>
                        <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                        <InputAdornment position='start'>min</InputAdornment>
                      </Box>
                    )
                  }}
                />
              )}
            />
            <CustomDivider>
              <Title variant='h5'>
                {dictionary.course.enrollment} {dictionary.common.setting}
              </Title>
            </CustomDivider>
            <FormControl fullWidth>
              <InputLabel id='joinType' error={Boolean(errors.joinType)}>
                <RequiredStar /> {`${dictionary.course.howStudentJoin}`}
              </InputLabel>
              <Controller
                name='joinType'
                control={control}
                render={({ field }) => (
                  <Select
                    label={dictionary.course.howStudentJoin}
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    error={Boolean(errors.joinType)}
                    onChange={event => {
                      field.onChange(event, Number.parseInt(event.target.value as string))
                    }}
                  >
                    {joinCourseType.map((type, index) =>
                      !organizationId && index === joinCourseType.length - 1 ? (
                        <></>
                      ) : (
                        <MenuItem key={type} value={index}>
                          {type}
                        </MenuItem>
                      )
                    )}
                  </Select>
                )}
              />
              <FormHelperText>{joinTypeTip()}</FormHelperText>
              {errors.joinType && <FormHelperText error>{dictionary.common.fieldRequired}</FormHelperText>}
            </FormControl>
            <Controller
              name='deadline'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <AppReactDatepicker
                  selected={field.value as Date}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={15}
                  onChange={date => {
                    setValue('deadline', date as Date)
                  }}
                  dateFormat='MM/dd/yyyy h:mm aa'
                  customInput={
                    <TextField
                      fullWidth
                      label={dictionary.course.deadline}
                      {...(errors.deadline && {
                        error: true,
                        helperText: errors?.deadline?.message
                      })}
                    />
                  }
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel id='isPrivate' error={Boolean(errors.isPrivate)}>
                <RequiredStar /> {`${dictionary.course.isPrivate}`}
              </InputLabel>
              <Controller
                name='isPrivate'
                control={control}
                render={({ field }) => (
                  <Select
                    label={dictionary.course.isPrivate}
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    error={Boolean(errors.isPrivate)}
                    onChange={event => {
                      field.onChange(event, event.target.value === '' ? null : Number(event.target.value))
                    }}
                  >
                    {[dictionary.common.yes, dictionary.common.no].map((name, index) => (
                      <MenuItem key={name} value={index}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText>{privateTip()}</FormHelperText>
              {errors.isPrivate && <FormHelperText error>{dictionary.common.fieldRequired}</FormHelperText>}
            </FormControl>

            <Controller
              name='offline'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  label={dictionary.course.virtual}
                  control={<Switch {...field} checked={field.value === true} onChange={field.onChange} />}
                />
              )}
            />
            {watch('offline') === true && (
              <>
                <FormControl fullWidth>
                  <Controller
                    name='address'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <AddressInput
                        value={field.value as string}
                        onChange={newValue => field.onChange(newValue)}
                        label='Address'
                      />
                    )}
                  />
                  {errors.address && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors.address.message}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <Controller
                    name='classroom'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={'Classroom Information'}
                        error={Boolean(errors.classroom)}
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                        }}
                      />
                    )}
                  />
                  {errors.classroom && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors.classroom.message}</FormHelperText>
                  )}
                </FormControl>
              </>
            )}
            <FormControl fullWidth>
              <Tag
                onChange={value => {
                  setLabels(value as Label[])
                }}
              />
            </FormControl>
            {/* <LoadingButton className='hidden' ref={ref} onClick={handleSubmit(onSubmit)} loading={saveLoading}>
            {dictionary.common.submit}
          </LoadingButton> */}
          </div>
        </div>
      </Card>
    </FormLayout>
  )
}

export default SaveCourse
