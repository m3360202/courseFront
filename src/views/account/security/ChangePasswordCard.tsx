'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// API Imports
import { changePasswordDirect } from '@/api/user/profile/changePwdDirect'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'

import { error, success } from '@/utils/toasts'
import { UserTable } from '@/types/user/UserTable';

const ChangePasswordCard = () => {

  const user = useUser()
  // States
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [currentPwd, setCurrentPwd] = useState<string>('')
  const [newPwd, setNewPwd] = useState<string>('')
  const [confirmPwd, setConfirmPwd] = useState<string>('')

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown)
  }

  const reSet = () => {
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
  }

  const handleSubmit = async () => {
    if (!newPwd || (!currentPwd && !user?.googleId) || !confirmPwd) {

      return error('Please input all field')
    }
    else if (confirmPwd && newPwd && (newPwd !== confirmPwd)) {

      return error('New password and confirm password is not same')
    }
    else {
      try {
        const result: any = await changePasswordDirect(
          {
            oldPassword: currentPwd,
            newPassword: newPwd,
            user: user as UserTable
          })

        if (result && result.success) {
          success('Change password success!')
        }
        if (result && !result.success && result.message) {
          error(result.message)
        }
      }
      catch (err: any) {
        console.log('err:', err)
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent>
        <form>
          {!user?.googleId && (
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Current Password'
                  value={currentPwd}
                  type={isCurrentPasswordShown ? 'text' : 'password'}
                  onChange={(e) => { setCurrentPwd(e.target.value) }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowCurrentPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isCurrentPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>)}
          <Grid container className='mbs-0' spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='New Password'
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value) }}
                type={isNewPasswordShown ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Confirm New Password'
                value={confirmPwd}
                onChange={(e) => { setConfirmPwd(e.target.value) }}
                type={isConfirmPasswordShown ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6' color='text.secondary'>
                Password Requirements:
              </Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5 text-textSecondary'>
                  <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                  Minimum 8 characters long - the more, the better
                </div>
                <div className='flex items-center gap-2.5 text-textSecondary'>
                  <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                  At least one lowercase & one uppercase character
                </div>
                <div className='flex items-center gap-2.5 text-textSecondary'>
                  <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                  At least one number, symbol, or whitespace character
                </div>
              </div>
            </Grid>
            <Grid item xs={12} className='flex gap-4'>
              <Button variant='contained' onClick={handleSubmit}>Save Changes</Button>
              <Button variant='outlined' onClick={reSet} type='reset' color='secondary'>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
