// MUI Imports

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import LoadingButton from '@mui/lab/LoadingButton'

import DirectionalIcon from '@components/DirectionalIcon'
import { useDictionary } from '@/hooks/useDictionary'

type StepPersonalInfoProps = {
  handlePrev: () => void
}

const StepFinished = ({ handlePrev }: StepPersonalInfoProps) => {
  //hooks
  const dictionary = useDictionary()
  const { replace } = useRouter()

  return (
    <>
      <div className='mbe-5 text-center'>
        <Typography variant='h5'>{dictionary.forgotPassword.finished}</Typography>
        <Typography variant='h5'>
          <Button
            onClick={() => {
              replace(`/login`)
            }}
          >
            {dictionary.common.gotoLogin}
          </Button>
        </Typography>
      </div>
      <Grid container spacing={5}>
        <Grid item xs={12} className='flex justify-between'>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <LoadingButton
            variant='contained'
            onClick={() => {
              replace(`/login`)
            }}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Next
          </LoadingButton>
        </Grid>
      </Grid>
    </>
  )
}

export default StepFinished
