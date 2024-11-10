import { updateSessionStudentStatus } from '@/api/course/updateSessionStudentStatus'
import { StatusList, Student } from '@/types/course/student'
import { UserTable } from '@/types/user/UserTable'
import { success } from '@/utils/toasts'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  statusList?: StatusList[]
  user: UserTable | null
  courseId: string
  sessionId: string
  student: Student
  setChangeStatus: Dispatch<SetStateAction<boolean>>
}
const ChangeStudentStatus = ({ statusList, user, courseId, sessionId, student, setChangeStatus }: Props) => {
  setChangeStatus(false)

  return (
    <FormControl variant='standard' sx={{ m: 1, minWidth: 120 }}>
      <InputLabel>Status</InputLabel>
      <Select
        id={student._id}
        value={student.status}
        onChange={async e => {
          e.preventDefault()
          e.stopPropagation()
          if (e.target.value === '&*add') {
            e.preventDefault()

            return
          } else if (e.target.value === '&*manage') {
            return
          }
          await updateSessionStudentStatus(user as UserTable, courseId, sessionId, {
            userId: student._id,
            lessonStatus: e.target.value as string
          })
          setChangeStatus(true)
          success('Status changed!')
        }}
        label='Status'
        sx={{ width: '220px' }}
      >
        <MenuItem value={''} sx={{ display: 'none' }}>
          none
        </MenuItem>
        {statusList?.map(item => (
          <MenuItem key={item._id} value={item._id}>
            {item.title}
          </MenuItem>
        ))}
        {/* <MenuItem value='&*add' sx={{ mt: 4 }} onClick={() => {}}>
          <Button variant='outlined' fullWidth startIcon={<i className='ri-add-line'></i>}>
            Add Status
          </Button>
        </MenuItem>
        <MenuItem value='&*manage' sx={{ mt: 2 }} onClick={() => {}}>
          <Button variant='outlined' fullWidth startIcon={<i className='ri-list-check'></i>}>
            Manage
          </Button>
        </MenuItem> */}
      </Select>
    </FormControl>
  )
}

export default ChangeStudentStatus
