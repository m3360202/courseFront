import moment from 'moment-timezone'

const isFinished = (
  startDateTime: string | Date,
  sessionStartTime: string | Date,
  sessionDuration: number,
  userTimeZone: string
) => {
  const serverLocalTime = moment(startDateTime).tz(userTimeZone)
  const copyStartTime = moment(sessionStartTime).tz(userTimeZone)

  serverLocalTime.hour(copyStartTime.hour())
  serverLocalTime.minute(copyStartTime.minute() + sessionDuration)
  const userLocalTime = moment.tz(userTimeZone)

  
return serverLocalTime.isBefore(userLocalTime)
}

export default isFinished
