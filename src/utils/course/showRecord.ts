import { UserTable } from '@/types/user/UserTable'
import getTimeZone from '../getTimeZone'
import moment from 'moment'
import { convertSessionDate } from '../date'

const showRecord = (
  user: UserTable,
  sessionDate: string | Date,
  sessionTimeZone?: string,
  sessionDuration?: number
) => {
  const timeZone = getTimeZone(user)
  const lessonDate = moment(convertSessionDate(sessionDate, sessionTimeZone, user.timeZone))
  const lessonDuration = sessionDuration || 0
  lessonDate.minute(lessonDate.minute() + lessonDuration)
  if (lessonDate.isBefore(moment(new Date()).tz(timeZone))) {
    return true
  }

  return false
}

export default showRecord
