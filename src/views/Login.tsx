'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { valibotResolver } from '@hookform/resolvers/valibot'
import classnames from 'classnames'
import { signIn } from 'next-auth/react'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { minLength, nonEmpty, object, pipe, string, unknown } from 'valibot'

import LoadingButton from '@mui/lab/LoadingButton'

import type { Locale } from '@configs/i18n'
import type { Mode } from '@core/types'

// Api Imports
import { getCaptcha } from '@/api/user/getCaptcha'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

import { getErrorMessage } from '@/utils/getErrorMessage'
import { useObjectCookie } from '@/@core/hooks/useObjectCookie'
import CookiesKey from '@/types/cookiesKey'

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string('Email/UserName is required'), minLength(1, 'Email/UserName is required')),
  password: pipe(
    string('Password is required'),
    nonEmpty('Password is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState<string>('')
  const [errorCaptcha, setErrorCaptcha] = useState<boolean>(false)
  const [errorCount, setErrorCount] = useState<number>(0)
  const [captchaDOM, setCaptchaDOM] = useState<string>('')
  const [captchaText, setCaptchaText] = useState<string>('')
  const [showCaptcha, setShowCaptcha] = useState<boolean>(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const [redirectToCookie, setRedirectToCookie] = useObjectCookie<string>(CookiesKey.RedirectTo, null)

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema)
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleGetCaptcha = async () => {
    try {
      const data = await getCaptcha()
      setCaptchaDOM(data.data)
      setCaptchaText(data.text)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const redirectURL = searchParams.get('redirectTo') ?? '/'
    setRedirectToCookie(getLocalizedUrl(redirectURL, locale as Locale))
  }, [searchParams])

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    // const res = await signIn('credentials', {
    //   email: data.email,
    //   password: data.password,
    //   redirect: false
    // })
    setLoading(true)
    setErrorCaptcha(false)
    if (showCaptcha) {
      if (captchaText.toLowerCase() !== captcha.toLowerCase()) {
        setErrorCaptcha(true)
        setLoading(false)

        return
      }
    }

    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && res.error === null) {
      // Vars
      let redirectURL = redirectToCookie //searchParams.get('redirectTo') ?? '/'
      if (redirectURL.includes('/join')) {
        redirectURL = `/callback/join/${redirectURL.split('/')[3]}`
      }

      router.replace(getLocalizedUrl(redirectURL, locale as Locale))
    } else {
      if (res?.error) {
        const error = getErrorMessage(res.error)

        if (error.indexOf('password') !== -1) {
          setError('password', { message: error })
          setErrorState(null)
          setErrorCount(errorCount + 1)
          if (errorCount > 1) {
            console.log('Too many failed attempts', errorCount)
            await handleGetCaptcha()
            setShowCaptcha(true)
          }
        } else setErrorState(error)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    return () => {
      setShowCaptcha(false)
      setErrorCount(0)
    }
  }, [])

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
          image1={{ src: '/images/illustrations/objects/tree-2.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>

          <form
            noValidate
            action={() => { }}
            autoComplete='off'
            className='flex flex-col gap-5'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSubmit(onSubmit)()
              }
            }}
          >
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value === undefined ? unknown : field.value}
                  fullWidth
                  autoFocus
                  type='email'
                  label='Email/UserName'
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  {...((errors.email || errorState !== null) && {
                    error: true,
                    helperText: errors?.email?.message || errorState
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
                  value={field.value === undefined ? unknown : field.value}
                  fullWidth
                  label='Password'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
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
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            {showCaptcha && (
              <>
                <TextField
                  fullWidth
                  label='Captcha'
                  id='captcha'
                  type='text'
                  value={captcha}
                  onChange={e => {
                    setCaptcha(e.target.value)
                    setErrorCaptcha(false)
                  }}
                />
                {errorCaptcha && (
                  <Typography
                    sx={{ color: 'rgb(255, 76, 81)', fontSize: '13px', marginTop: '-5px', marginLeft: '15px' }}
                  >
                    Captcha Wrong
                  </Typography>
                )}
                <div
                  onClick={() => getCaptcha()}
                  style={{
                    marginTop: errorCaptcha ? '-28%' : '-19%',
                    marginLeft: '58%',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 999,
                    transform: 'translateX(-2px)'
                  }}
                  dangerouslySetInnerHTML={{ __html: captchaDOM }}
                ></div>
              </>
            )}
            <div className='flex justify-end items-center flex-wrap gap-x-3 gap-y-1'>
              {/* <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' /> */}
              <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                Forgot password?
              </Typography>
            </div>
            <LoadingButton fullWidth variant='contained' loading={loading} onClick={handleSubmit(onSubmit)}>
              Log In
            </LoadingButton>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href='/register' color='primary'>
                Create an account
              </Typography>
            </div>
          </form>
          <Divider className='gap-3'>or</Divider>
          <Button
            color='secondary'
            className='self-center text-textPrimary'
            startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
            sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Login
