import { UserTable } from '@/types/user/UserTable'
import { transformLocalDateZone } from '@/utils/date'
import { Box, CardContent, Typography } from '@mui/material'

export function showSplitSchedule(schedule: any, user: UserTable | null) {
  const scheduleCopy = JSON.parse(JSON.stringify(schedule) || '[]')
  scheduleCopy?.map((item: any) => {
    item.schedule = item.scheduleDate?.map((d: any) => transformLocalDateZone(d, user).format('yyyy-MM-dd HH:mm'))
  })
  // 定义一个对象用于存放每个星期几的时间段数据
  const weeklySchedule: any = {}

  // 遍历输入的时间段数据
  scheduleCopy?.forEach((timeSlot: any) => {
    // 获取当前时间段所在的星期�
    const weekName = timeSlot.weekName
    // 如果当前星期几不存在�weeklySchedule 中，则初始化为一个空数组
    if (!weeklySchedule[weekName]) {
      weeklySchedule[weekName] = []
    }
    // 将当前时间段的时间段加入到相应的星期几下
    weeklySchedule[weekName].push(...timeSlot.schedule)
  })

  // 将每个星期几的时间段数据合并成一条，以时间段的形式显示，并按小时和分钟排�
  let formattedSchedule = Object.keys(weeklySchedule).map(weekName => {
    // 去除重复的时间段并按小时和分钟排�
    const uniqueSchedule = Array.from(new Set(weeklySchedule[weekName])).sort((a: any, b: any) => {
      const aHour = parseInt(a.split(' ')[1].split(':')[0])
      const aMinute = parseInt(a.split(' ')[1].split(':')[1])
      const bHour = parseInt(b.split(' ')[1].split(':')[0])
      const bMinute = parseInt(b.split(' ')[1].split(':')[1])
      if (aHour !== bHour) {
        return aHour - bHour
      } else {
        return aMinute - bMinute
      }
    })
    // 将时间段按照 "HH:mm" 格式组合成字符串，并添加到结果中
    const result = {
      weekName: weekName,
      schedule: uniqueSchedule.map((time: any) => time.split(' ')[1])
    }

    return result
  })

  formattedSchedule = formattedSchedule?.map((item: any) => {
    const schedule = []
    for (let i = 0; i < item.schedule.length; i += 3) {
      const startTime = item.schedule[i]
      let endTime = item.schedule[i]
      if (i + 2 < item.schedule.length) {
        endTime = item.schedule[i + 2]
      } else if (i + 1 < item.schedule.length) {
        endTime = item.schedule[i + 1]
      }
      if (startTime !== endTime) schedule.push(`${startTime}~${endTime} `)
      else schedule.push(`${startTime}`)
    }

    return {
      weekName: item.weekName,
      schedule
    }
  })

  return formattedSchedule
}

export const renderSchedule = (schedule: any, user: UserTable | null) => (
  <CardContent className='flex flex-col gap-4'>
    {showSplitSchedule(schedule, user).map(item => (
      <Box key={item.weekName} display={'flex'} gap={5} alignItems={'baseline'}>
        <Typography width={80}>{item.weekName}</Typography>
        <Box display={'flex'} gap={4}>
          {item.schedule?.map(s => (
            <Typography key={s} sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 1 }}>
              {s}
            </Typography>
          ))}
        </Box>
      </Box>
    ))}
  </CardContent>
)
