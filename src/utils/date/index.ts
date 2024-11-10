import moment from 'moment-timezone'

import type { UserTable } from '@/types/user/UserTable'
import getTimeZone from '../getTimeZone'

export const transformLocalDateZoneToUTC = (date: Date | string, user: UserTable | undefined | null) => {
  const datetime = moment(date) // Local time, no timezone specified
  const timezone: string = getTimeZone(user)

  const dateInUTC = datetime.clone().tz(timezone, true).utc().format()

  return dateInUTC
}

export const transformDateFromUTC = (date: Date | string, user: UserTable | null) => {
  const timezone: string = getTimeZone(user)
  const dateInUserTimeZone = moment.utc(date).tz(timezone).format()

  return new Date(dateInUserTimeZone)
}

export const transformDateToUserTimeZone = (date: Date | string, user: UserTable | null) => {
  const timezone: string = getTimeZone(user)
  const dateInUserTimeZoneTime = moment.utc(date).tz(timezone)

  return dateInUserTimeZoneTime
}

export const sessionDateFormat = (time: Date | string, timezone?: string) => {
  const date = new Date(time)

  const options: any = { year: '2-digit', month: '2-digit', day: '2-digit', ...(timezone && { timeZone: timezone }) }

  const formattedDate = date.toLocaleString('en-US', options)
  const [month, day] = formattedDate.split('/').slice(0, 2)

  return `${month}/${day}`
}

export const format_w_timezone = (
  date?: string | number | Date | null,
  formatStr?: string,
  nowYearFormat = true,
  nowFormat = 'MMM D',
  offsetTimeZone?: string,
  userTimeZone?: string
) => {
  const timeZone = userTimeZone || offsetTimeZone || moment.tz.guess()
  const newDate = moment(date).tz(timeZone)
  let thisFormat = ''
  if (nowYearFormat) {
    thisFormat = newDate.year() === new Date().getFullYear() ? nowFormat : formatStr ? formatStr : 'YYYY/MM/DD'
  } else {
    thisFormat = formatStr ? formatStr : 'YYYY/MM/DD'
  }

  return newDate.format(thisFormat)
}

export const sessionDateTimeFormat = (time: Date | string, timezone: string | undefined) => {
  if (!time) return ''
  const date = typeof time === 'string' ? new Date(time) : time
  const options: any = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(timezone && { timeZone: timezone })
  }

  const formattedDate = date.toLocaleString('en-US', options)
  const [month, day, fulltime] = formattedDate.split('/').slice(0, 4)
  const localtime = fulltime.split(',')

  return `${month}/${day} ${localtime[1]}`
}

export const convertSessionDate = (
  time: Date | string,
  offsetTimeZone?: string,
  targetTimeZone?: string,
  userTimeZone?: string
) => {
  const offsetTime = moment.tz(time, offsetTimeZone || '')

  const timeZone = userTimeZone || targetTimeZone || moment.tz.guess()

  return offsetTime.clone().tz(timeZone).toDate()
}

export function timeStrToMinutes(timeString: string) {
  const timeParts = timeString.split(':').map(Number)

  if (timeParts.length !== 2 && timeParts.length !== 3) {
    return NaN // 输入的时间格式不正确
  }

  let minutes = 0
  if (timeParts.length === 2) {
    minutes = timeParts[0] + timeParts[1] / 60 // 将秒数转换为分钟
  } else if (timeParts.length === 3) {
    minutes = timeParts[0] * 60 + timeParts[1] + timeParts[2] / 60 // 将时分秒转换为分�
  }

  return minutes
}

export function formatDateToYYYYMMDD(utcDateString: string): string {
  // 解析 UTC 日期字符串
  const date = new Date(utcDateString)

  // 获取年、月和日
  const year = date.getUTCFullYear()
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0') // 月份是从 0 开始的
  const day = date.getUTCDate().toString().padStart(2, '0')

  // 拼接成所需格式
  return `${year}-${month}-${day}`
}

export function formatDateToYYYYMMDDHHII(utcDateString: string): string {
  // 解析 UTC 日期字符串
  const date = new Date(utcDateString)

  // 获取年、月和日
  const year = date.getUTCFullYear()
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0') // 月份是从 0 开始的
  const day = date.getUTCDate().toString().padStart(2, '0')
  const hour = date.getUTCHours().toString().padStart(2, '0')
  const minute = date.getUTCMinutes().toString().padStart(2, '0')

  // 拼接成所需格式
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export function getIsoWeekdayFromString(dayString: string) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return weekdays.indexOf(dayString)
}

export function getDateByDayAndTime(dayString: string, timeString: string) {
  const dayOfWeek = getIsoWeekdayFromString(dayString)
  // 获取当前日期和时�
  const currentDate = moment(timeString, 'HH:mm')

  return currentDate.day(dayOfWeek).toDate()
}

export const transformLocalDateZone = (date: Date | string, user: UserTable | null) => {
  const datetime = moment(date) // Local time, no timezone specified
  const timezone: string = getTimeZone(user)

  return datetime.clone().tz(timezone, true)
}

export function getLocalizedDurationFormatter(duration?: number) {
  try {
    if (!duration) return ''
    const dur = moment.duration(duration)
    const hours = dur.hours()
    const minutes = dur.minutes()
    const seconds = dur.seconds()
    if (hours !== 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  } catch (err) {}
}

export function getZoneAbbreviation(timeZone: string | undefined): string {
  if (!Intl || !Intl.DateTimeFormat || !timeZone) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const now = new Date()

  const formattedDateTime = formatter.formatToParts(now)

  const timeZonePart = formattedDateTime.find(part => part.type === 'timeZoneName')

  if (timeZonePart && timeZonePart.value) {
    return timeZonePart.value
  }

  const offset = new Date().getTimezoneOffset()
  const isNegative = offset < 0
  const offsetAbs = Math.abs(offset / 60)
  const offsetSign = isNegative ? '-' : '+'

  return `(GMT${offsetSign}${offsetAbs})`
}

export function formatUtcDateToDateTime(utcDateString: any) {
  if (isNaN(Date.parse(utcDateString))) {
    console.error('Invalid date string provided:', utcDateString)
    
    return ''
  }

  const utcDate = new Date(utcDateString)

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(utcDate)
  const dateTimeParts: any = {}
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateTimeParts[part.type] = part.value
    }
  })

  const formattedDateTime = `${dateTimeParts.year}-${dateTimeParts.month}-${dateTimeParts.day} ${dateTimeParts.hour}:${dateTimeParts.minute}:${dateTimeParts.second}`

  return formattedDateTime
}
