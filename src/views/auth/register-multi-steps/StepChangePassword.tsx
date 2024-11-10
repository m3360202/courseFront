// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports

import LoadingButton from '@mui/lab/LoadingButton'

import DirectionalIcon from '@components/DirectionalIcon'

import { getErrorMessage } from '@/utils/getErrorMessage'
import { changePassword } from '@/api/user/changePassword'
import type { valueType } from '.'
import { validatePassword } from '@/utils/validatePassword'
import { useDictionary } from '@/hooks/useDictionary'

type StepAccountDetailsProps = {
  handleNext: () => void
  handlePrev: () => void
  value: valueType | undefined
}

const StepChangePassword = ({ handlePrev, handleNext, value }: StepAccountDetailsProps) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [confirmPassowrd, setConfirmPassword] = useState<string | undefined>(undefined)
  const [passwordError, setPasswordError] = useState<string | undefined>('')
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>('')
  const [loading, setLoading] = useState(false)

  const dictionary = useDictionary()

  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown)
  }

  const handleClickShowConfirmPassword = () => {
    setIsConfirmPasswordShown(!isConfirmPasswordShown)
  }

  const next = async () => {
    let valid = true

    if (!password) {
      setPasswordError(dictionary.common.passwordRequired)
      valid = false
    }

    if (!confirmPassowrd) {
      setConfirmPasswordError(dictionary.common.confirmPasswordRequired)
      valid = false
    }

    if (password && !validatePassword(password as string)) {
      setPasswordError(dictionary.common.passwordInvalid)
      valid = false
    }

    if (confirmPassowrd && !validatePassword(confirmPassowrd as string)) {
      setConfirmPasswordError(dictionary.common.passwordInvalid)
      valid = false
    }

    if (!valid) return

    if (password !== confirmPassowrd) {
      setConfirmPasswordError(dictionary.common.passwordInconsistent)

      return
    }

    setLoading(true)

    try {
      await changePassword(value?.email as string, password as string, value?.code as string)
      handleNext()
    } catch (err) {
      const errorMsg = getErrorMessage(err)

      setConfirmPasswordError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h5'>{dictionary.forgotPassword.sendEmail}</Typography>
      </div>
      <Grid container spacing={5} display={'flex'} flexDirection={'column'}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={dictionary.common.password}
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
            onChange={e => {
              setPassword(e.target.value)

              if (!e.target.value) setPasswordError(dictionary.common.passwordRequired)
              else if (!validatePassword(e.target.value)) setPasswordError(dictionary.common.passwordInvalid)
              else {
                setPasswordError(undefined)
              }
            }}
            error={passwordError ? true : undefined}
            helperText={passwordError}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={dictionary.common.confirmPassword}
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
            onChange={e => {
              setConfirmPassword(e.target.value)

              if (!e.target.value) setConfirmPasswordError(dictionary.common.passwordRequired)
              else if (!validatePassword(e.target.value)) setConfirmPasswordError(dictionary.common.passwordInvalid)
              else {
                setConfirmPasswordError(undefined)
              }
            }}
            error={confirmPasswordError ? true : undefined}
            helperText={confirmPasswordError}
          />
        </Grid>

        <Grid item xs={12} className='flex justify-between'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
            onClick={handlePrev}
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

export default StepChangePassword
