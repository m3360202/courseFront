// Mui Imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'

// Types Imports
import { Schedule } from '@/types/organization/schedule'
import { UserTable } from '@/types/user/UserTable'

// Utils Imports
import moment from 'moment-timezone'

function getIsoWeekdayFromString(dayString: string) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return weekdays.indexOf(dayString)
}

function getDateByDayAndTime(dayString: string, timeString: string) {
  const dayOfWeek = getIsoWeekdayFromString(dayString)
  const currentDate = moment(timeString, 'HH:mm')

  return currentDate.day(dayOfWeek).toDate()
}

export function mergeTime(times: any){
  if (!times || times.length === 0) return [];

  const sortedTimes = times.sort((a: any, b: any) => {
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);

    return (ah - bh) || (am - bm);
  });

  const mergedTimes = [];
  let start = null;
  let end = null;

  for (const time of sortedTimes) {
    const [hour, minute] = time.split(':').map(Number);
    if (start === null) {
      start = time;
      end = time;
    } else {
      const [endHour, endMinute] = end.split(':').map(Number);
      // 检查是否是连续的时间段
      if (hour === endHour && minute === endMinute + 60 || // 处理跨小时的情况
        hour === endHour + 1 && minute === 0) {          // 处理小时递增的情况
        end = time;
      } else {
        // 如果不是连续的时间段，保存当前时间段并开始新的时间段
        mergedTimes.push(`${start} - ${end}  `);
        start = time;
        end = time;
      }
    }
  }
  // 保存最后一个时间段
  if (start !== null) {
    mergedTimes.push(`${start} - ${end}  `);
  }

  return mergedTimes;
}

export default function TeachingSchedule(
    { 
      schedule,
      setSchedule
     } :
    { 
      schedule: Schedule[] | undefined,
      setSchedule: (value: Schedule[] | undefined) => void,
     })
   {
  const user = useUser()

  // const weekDay = 'Sunday'
  // const startTime = '00:00'
  const weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const transformLocalDateZone = (date: Date | string, user: UserTable) => {
    const datetime = moment(date) // Local time, no timezone specified
    const timezone: string = user?.timeZone

    return datetime.clone().tz(timezone, true)
  }

  const isCheckedTime = (day: number, time: string) => {

    return (
      schedule?.find(c =>
        c.scheduleDate?.find(
          b => transformLocalDateZone(b, user as UserTable).format('HH:mm') === time && transformLocalDateZone(b, user as UserTable).day() === day
        )
      ) !== undefined
    )
  }

  const timeOptions = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
  ]

  const handleSchedule = (weekName: string, range: string) => {
    const scheduleCopy = [...(schedule || [])];
    const obj = scheduleCopy.find(c => c.weekName === weekName);

    if (obj) {
      const index = obj.schedule?.findIndex((c: any) => c === range);
      if (index !== -1) obj.schedule.splice(index, 1);
      else obj.schedule.push(range);
      if (obj.schedule?.length === 0) {
        const sIndex = scheduleCopy.findIndex(c => c.weekName === weekName);
        scheduleCopy.splice(sIndex, 1);
      } else {
        obj.schedule?.sort();
      }
    } else {
      scheduleCopy.push({
        weekName,
        schedule: [range]
      });
    }

    // Sort the scheduleCopy array by weekName in the order from Sunday to Saturday
    scheduleCopy.sort((a, b) => {
      // Assuming the week starts with Sunday and ends with Saturday
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      return daysOfWeek.indexOf(a.weekName) - daysOfWeek.indexOf(b.weekName);
    });

    // Update the scheduleDate for each schedule
    scheduleCopy.map(schedule => {
      const scheduleDate: Date[] = [];
      schedule.schedule.map(item => {
        scheduleDate.push(getDateByDayAndTime(schedule.weekName, item));
      });

      // Sort the scheduleDate from Sunday to Saturday
      scheduleDate.sort((a, b) => a.getDay() - b.getDay()); // a.getDay() returns 0 for Sunday, 1 for Monday, etc.
      schedule.scheduleDate = scheduleDate;
    });

    setSchedule(scheduleCopy);
  };

  return (
    <>
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center',marginTop:'10px', marginBottom:'10px' }}>
          <Select
            value={weekDay}
            onChange={(e) => {
              setWeekDay(e.target.value)
            }}
            label='WeekName'
            sx={{ width: '220px', marginRight: '10px' }}
          >
            <MenuItem value={'Sunday'}>
              Sunday
            </MenuItem>
            <MenuItem value={'Monday'}>
              Monday
            </MenuItem>
            <MenuItem value={'Tuesday'}>
              Tuesday
            </MenuItem>
            <MenuItem value={'Wednesday'}>
              Wednesday
            </MenuItem>
            <MenuItem value={'Thursday'}>
              Thursday
            </MenuItem>
            <MenuItem value={'Friday'}>
              Friday
            </MenuItem>
            <MenuItem value={'Saturday'}>
              Saturday
            </MenuItem>
          </Select>

          <Select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            label="Range"
            sx={{ width: '220px', marginRight: '10px' }}
          >
            {timeOptions.map(time => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={() => { handleSaveAvailability() }}
          >
            Add Schedule
          </Button>
        </Box> */}
      <TableContainer style={{ display: 'flex' }}>
        <Table
          id="select-table"
          sx={{
            '& .MuiTableCell-root': {
              border: '1px solid rgba(224, 224, 224, 1)'
            }
          }}
        >
          <TableHead sx={{ backgroundColor: '#FFFFFF' }}>
            <TableRow>
              <TableCell>WeekName / Time</TableCell>
              {timeOptions.map(time => (
                <TableCell key={time}>{time}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weekNames.map((weekName, weekIndex) => (
              <TableRow key={weekName}>
                <TableCell
                  sx={{
                    background: 'inherit',
                    '&:hover': { background: 'rgba(224, 224, 224, 1)' }
                  }}
                >
                  {weekName}
                </TableCell>
                {timeOptions.map(time => (
                  <TableCell
                    key={`${weekName}-${time}`}
                    sx={{
                      width: '150px',
                      background: isCheckedTime(weekIndex, time)
                        ? 'rgba(140, 87, 255, 0.6)'
                        : 'inherit',
                      cursor: 'crosshair',
                      userSelect: 'none',
                      '&:hover': { background: 'rgba(140, 87, 255, 0.3)' }
                    }}
                    onMouseDown={async () => {
                      handleSchedule(weekName, time)
                    }}
                  >
                    &nbsp;
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer style={{ display: 'flex', marginTop: '20px' }}>
        <Table
          id="select-table"
          sx={{
            width: '240px',
            '& .MuiTableCell-root': {
              border: '1px solid rgba(224, 224, 224, 1)'
            }
          }}
        >
          <TableHead sx={{ backgroundColor: '#FFFFFF' }}>
            <TableRow>
              <TableCell>WeekName</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule && schedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    background: 'inherit',
                    '&:hover': { background: 'rgba(224, 224, 224, 1)' }
                  }}
                >
                  {item.weekName}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table
          id="select-table"
          sx={{
            '& .MuiTableCell-root': {
              border: '1px solid rgba(224, 224, 224, 1)'
            }
          }}
        >
          <TableHead sx={{ backgroundColor: '#FFFFFF' }}>
            <TableRow>
              <TableCell>schedule</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule && schedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{mergeTime(item.schedule)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
