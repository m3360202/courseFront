// MUI Imports
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import LoadingButton from '@mui/lab/LoadingButton'

import DirectionalIcon from '@components/DirectionalIcon'
import { checkCode } from '@/api/user/checkCode'

import { getErrorMessage } from '@/utils/getErrorMessage'

import type { valueType } from '.'
import { useDictionary } from '@/hooks/useDictionary'

type StepPersonalInfoProps = {
  handleNext: () => void
  handlePrev: () => void
  setValue: Dispatch<SetStateAction<valueType | undefined>>
  activeStep: number
  value: valueType | undefined
}

const StepDigitCode = ({ handleNext, handlePrev, setValue, activeStep, value }: StepPersonalInfoProps) => {
  const dictionary = useDictionary()
  const [code, setCode] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>('')
  const [loading, setLoading] = useState(false)

  const next = async () => {
    if (code) {
      setLoading(true)

      try {
        await checkCode(value?.email as string, code)

        handleNext()
      } catch (err) {
        const errorMsg = getErrorMessage(err)

        setError(errorMsg)
      }
    } else setError(dictionary.forgotPassword.codeRequired)
    setLoading(false)
  }

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h5'>
          {dictionary.forgotPassword.digitCode.replace('$email', value?.email || '')}
        </Typography>
      </div>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={dictionary.forgotPassword.verifyCode}
            onChange={e => {
              setCode(e.target.value)

              if (!e.target.value) setError(dictionary.forgotPassword.codeRequired)
              else {
                setValue({ email: value?.email, code: e.target.value })
                setError(undefined)
              }
            }}
            error={error ? true : undefined}
            helperText={error}
          />
        </Grid>

        <Grid item xs={12} className='flex justify-between'>
          <Button
            disabled={activeStep === 0}
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <LoadingButton
            variant='contained'
            loading={loading}
            onClick={next}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Next
          </LoadingButton>
        </Grid>
      </Grid>
    </>
  )
}

export default StepDigitCode
