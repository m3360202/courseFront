import { joinCourse } from '@/api/course/joinCourse'
import TargetDialog from '@/components/dialog'
import { useCourse } from '@/hooks/useCourse'
import { useDictionary } from '@/hooks/useDictionary'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { error, success } from '@/utils/toasts'
import LoadingButton from '@mui/lab/LoadingButton'
import { Button, TextField } from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'

const JoinCourse = ({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) => {
  //Statas
  const [isError, setIsError] = useState(false)
  const [value, setValue] = useState<string>()
  const [loading, setLoading] = useState(false)

  //Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { course } = useCourse()

  const handleJoin = async () => {
    if (!value) {
      setIsError(true)

      return
    }
    if (isError) return
    try {
      setLoading(true)
      const params: { code: string; status?: number } = { code: value as string }
      if (course?.joinType === 1) params.status = 2
      const { success: result, message } = await joinCourse(user as UserTable, params)
      if (!result) {
        error(message)

        return
      }
      success(`${dictionary.course.joinCourse} ${dictionary.common.successful}`)
      setOpen(false)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <TargetDialog
      title={dictionary.course.joinCourse}
      width={'40%'}
      height={'40%'}
      open={open}
      setOpen={setOpen}
      content={
        <TextField
          id='classId'
          autoFocus
          fullWidth
          label={dictionary.course.classId}
          {...(isError && {
            error: true,
            helperText: dictionary.common.fieldRequired
          })}
          onChange={e => {
            setValue(e.target.value)
            if (!e.target.value) setIsError(true)
            else setIsError(false)
          }}
        />
      }
      actions={
        <>
          <Button
            onClick={() => {
              setOpen(false)
            }}
            variant='outlined'
            color='secondary'
          >
            {dictionary.common.cancel}
          </Button>
          <LoadingButton variant='contained' loading={loading} onClick={handleJoin}>
            {dictionary.common.confirm}
          </LoadingButton>
        </>
      }
    >
      <LoadingButton variant='contained'>{dictionary.course.joinCourse}</LoadingButton>
    </TargetDialog>
  )
}

export default JoinCourse
