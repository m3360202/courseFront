export const getSessionStatusText = (
  startTime: string | Date,
  endTime: string | Date,
  timeZone: string | undefined
) => {
  if (!timeZone) return ''
  const lessonStartTimeStamp = new Date(startTime).getTime() / 1000
  const lessonEndTimeStamp = new Date(endTime).getTime() / 1000
  const now = new Date()
  const nowInUserTimeZone = new Date(now.toLocaleString('en-US', { timeZone }))
  const nowTimeStamp = nowInUserTimeZone.getTime() / 1000

  if (nowTimeStamp < lessonStartTimeStamp) {
    return 'Upcoming'
  } else if (nowTimeStamp > lessonEndTimeStamp) {
    return 'Expired'
  } else {
    return 'Active'
  }
}

export const getSessionStatusColor = (status: any) => {
  switch (status) {
    case 'Expired':
      return 'secondary'
    case 'Upcoming':
      return 'warning'
    case 'Active':
      return 'success'
    default:
      return 'default'
  }
}
