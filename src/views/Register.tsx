'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, FormHelperText } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Type Imports
import type { InferInput } from 'valibot'
import { boolean, email, nonEmpty, object, pipe, regex, string, value } from 'valibot'
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { re } from '@/utils/validatePassword'
import type { RegisterParams } from '@/api/user/register'
import { register } from '@/api/user/register'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { verifyInvitationCode } from '@/api/user/verifyInvitationCode'
import { useDictionary } from '@/hooks/useDictionary'

// Api Imports
import { checkUserEmail, checkUserName } from '@/api/user/verifyUser'

const RegisterV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'

  // Hooks
  const { lang: locale } = useParams()
  const { push } = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { settings } = useSettings()
  const dictionary = useDictionary()
  const searchParams = useSearchParams()

  type FormData = InferInput<typeof schema> & { invitationCode: string }

  const schema = object({
    username: pipe(string(), nonEmpty(dictionary.common.userNameRequired)),
    email: pipe(string(), nonEmpty(dictionary.common.emailRequired), email(dictionary.common.emailInvalid)),
    password: pipe(
      string(),
      nonEmpty(dictionary.common.passwordRequired),
      regex(re, dictionary.common.passwordInvalid)
    ),
    confirmPassword: pipe(
      string(),
      nonEmpty(dictionary.common.passwordRequired),
      regex(re, dictionary.common.passwordInvalid)
    ),
    policyChecked: pipe(boolean(), value(true, dictionary.common.teamPolicyRequired))
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      policyChecked: false,
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const handleCheckUsername = async (username: string) => {
    const result = await checkUserName(username)
    if (result && result.state === 1) {
      setError('username', { message: 'The username has been registered. Please try another one.' })
      setDisabled(true)
    } else {
      clearErrors('username');
      setDisabled(false)
    }
  }

  const handleCheckEmail = async (email: string) => {
    const result = await checkUserEmail(email)
    if (result && result.state === 1) {
      setError('email', { message: 'The email has been registered. Please try another one.' })
      setDisabled(true)
    }
    else {
      clearErrors('email');
      setDisabled(false)
    }
  }

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {

    const { password, confirmPassword, invitationCode } = data

    if (password !== confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: dictionary.common.passwordInconsistent
      })

      return
    }


    setLoading(true)

    if (invitationCode) {
      const useInvitationCodeResult: any = await verifyInvitationCode({ invitationCode })

      if (!useInvitationCodeResult.success) {
        setError('invitationCode', {
          type: 'manual',
          message: ' invitation code invalid.'
        })
        setLoading(false)

        return
      }
    }

    try {
      await register(data as RegisterParams)
      let url = `/welcome?email=${data.email}`;
      if (searchParams.get('redirectTo')) url += `&redirectTo=${searchParams.get('redirectTo')}`
      push(getLocalizedUrl(url, locale as Locale))
    } catch (err: any) {
      const error = getErrorMessage(err)
      console.log('--------', error)
      if (error.indexOf('username') !== -1) {
        setError('username', { message: error })
      } else if (error.indexOf('email') !== -1) {
        setError('email', { message: error })
      } else {
        setError('email', { message: 'Failed to send activation email,please check your email' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        {/* <div className='plb-12 pis-12'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div> */}
        <Illustrations
          image1={{ src: '/images/illustrations/objects/tree-3.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Register for Xtatic 🚀</Typography>
            <Typography className='mbe-1'>{dictionary.register.makeFun}</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
            <Controller
              name='username'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  label={dictionary.common.userName}
                  onChange={async (e) => {
                    field.onChange(e.target.value)
                    await handleCheckUsername(e.target.value)
                  }}
                  {...(errors.username && {
                    error: true,
                    helperText: errors?.username?.message
                  })}
                />
              )}
            />
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={dictionary.common.email}
                  onChange={async (e) => {
                    field.onChange(e.target.value)
                    await handleCheckEmail(e.target.value)
                  }}
                  {...(errors.email && {
                    error: true,
                    helperText: errors?.email?.message
                  })}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={dictionary.common.password}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onChange={e => {
                    field.onChange(e.target.value)
                  }}
                  {...(errors.password && {
                    error: true,
                    helperText: errors?.password?.message
                  })}
                />
              )}
            />
            <Controller
              name='confirmPassword'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={dictionary.common.confirmPassword}
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onChange={e => {
                    field.onChange(e.target.value)
                  }}
                  {...(errors.confirmPassword && {
                    error: true,
                    helperText: errors?.confirmPassword?.message
                  })}
                />
              )}
            />
            <Controller
              name='invitationCode'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  label={dictionary.register.invitationCode}
                  onChange={e => {
                    field.onChange(e.target.value)
                  }}
                  {...(errors.invitationCode && {
                    error: true,
                    helperText: errors?.invitationCode?.message
                  })}
                />
              )}
            />
            <div className='flex justify-between items-center gap-3'>
              <Controller
                name='policyChecked'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Box display={'flex'} flexDirection={'column'}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          onChange={(e, c) => {
                            field.onChange(c)
                          }}
                        />
                      }
                      label={
                        <>
                          <span>I agree to </span>
                          <Link
                            className='text-primary'
                            href={process.env.NEXT_PUBLIC_POLICY as string}
                            target='_blank'
                          >
                            privacy policy & terms
                          </Link>
                        </>
                      }
                    />
                    {errors.policyChecked && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.policyChecked.message}</FormHelperText>
                    )}
                  </Box>
                )}
              />
            </div>
            <LoadingButton
              fullWidth
              variant='contained'
              type='submit'
              loading={loading}
              disabled={disabled}
              onClick={handleSubmit(onSubmit)}
            >
              {dictionary.common.signUp}
            </LoadingButton>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{dictionary.register.haveAccount}?</Typography>
              <Typography component={Link} href='/login' color='primary'>
                {dictionary.common.signIn}
              </Typography>
            </div>
            {/* <Divider className='gap-3'>or</Divider>
            <div className='flex justify-center items-center gap-2'>
              <IconButton size='small'>
                <i className='ri-facebook-fill text-facebook' />
              </IconButton>
              <IconButton size='small'>
                <i className='ri-twitter-fill text-twitter' />
              </IconButton>
              <IconButton size='small'>
                <i className='ri-github-fill text-github' />
              </IconButton>
              <IconButton size='small'>
                <i className='ri-google-fill text-googlePlus' />
              </IconButton>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterV2
