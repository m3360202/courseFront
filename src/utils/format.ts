import moment from 'moment-timezone'

const format = (
  date?: string | number | Date | null,
  formatStr?: string,
  nowYearFormat = false,
  nowFormat = 'yyyy/MM/DD HH:mm',
  userTimeZone?: string
) => {
  if (!date) return ''
  let timeZone = moment.tz.guess()

  if (userTimeZone) {
    timeZone = userTimeZone
  }

  const newDate = moment(date).tz(timeZone)
  let thisFormat = ''

  if (nowYearFormat) {
    thisFormat = newDate.year() === new Date().getFullYear() ? nowFormat : formatStr ? formatStr : 'YYYY/MM/DD HH:mm'
  } else {
    thisFormat = formatStr ? formatStr : 'YYYY/MM/DD HH:mm'
  }

  return newDate.format(thisFormat)
}

export default format

export const formatFileSize = (size: number | undefined) => {
  if (!size) return ''

  return Math.round(size / 100) / 10 > 1000
    ? `${(Math.round(size / 100) / 10000).toFixed(1)} mb`
    : `${(Math.round(size / 100) / 10).toFixed(1)} kb`
}
