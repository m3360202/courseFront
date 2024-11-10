// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import LoadingButton from '@mui/lab/LoadingButton'

import DirectionalIcon from '@components/DirectionalIcon'
import { forgotPassword } from '@/api/user/forgotPassword'

import { getErrorMessage } from '@/utils/getErrorMessage'
import { validateEmail } from '@/utils/validateEmail'
import type { valueType } from '.'
import { useDictionary } from '@/hooks/useDictionary'

type StepAccountDetailsProps = {
  handleNext: () => void
  setValue: Dispatch<SetStateAction<valueType | undefined>>
}

const StepEmailVerify = ({ handleNext, setValue }: StepAccountDetailsProps) => {
  // States
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>('')
  const [loading, setLoading] = useState(false)

  //hooks
  const dictionary = useDictionary()
  const { push } = useRouter()

  const next = async () => {
    if (!validateEmail(email as string)) {
      setError(dictionary.common.emailInvalid)

      return
    }

    if (email) {
      setLoading(true)

      try {
        await forgotPassword(email)

        handleNext()
      } catch (err) {
        const errorMsg = getErrorMessage(err)

        setError(errorMsg)
      }
    } else setError(dictionary.common.emailRequired)
    setLoading(false)
  }

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h5'>{dictionary.forgotPassword.sendEmail}</Typography>
      </div>
      <Grid container spacing={5}>
        {/* <Grid item xs={12} sm={6}>
          <TextField fullWidth label='Username' placeholder='johnDoe' />
        </Grid> */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type='email'
            label={dictionary.forgotPassword.enterEmail}
            placeholder='johndoe@gmail.com'
            onChange={e => {
              setEmail(e.target.value)

              if (!e.target.value) setError(dictionary.common.emailRequired)
              else {
                if (!validateEmail(e.target.value)) setError(dictionary.common.emailInvalid)
                else {
                  setValue({ email: e.target.value })
                  setError(undefined)
                }
              }
            }}
            error={error ? true : undefined}
            helperText={error}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Password'
            placeholder='············'
            id='outlined-adornment-password'
            type={isPasswordShown ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    edge='end'
                    onClick={handleClickShowPassword}
                    onMouseDown={e => e.preventDefault()}
                    aria-label='toggle password visibility'
                  >
                    <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Confirm Password'
            placeholder='············'
            id='outlined-confirm-password'
            type={isConfirmPasswordShown ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    edge='end'
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={e => e.preventDefault()}
                    aria-label='toggle confirm password visibility'
                  >
                    <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label='Profile Link' placeholder='johndoe/profile' />
        </Grid> */}
        <Grid item xs={12} className='flex justify-between'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
            onClick={() => {
              push('/login')
            }}
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

export default StepEmailVerify
