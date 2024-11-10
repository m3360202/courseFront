'use client'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Type Imports
import type { Mode } from '@core/types'


const NotAuthorized = ({ mode }: { mode: Mode }) => {
  console.log(mode)
  // Hooks
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()

  return (
    <div className='flex items-center justify-center  relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography className='text-8xl font-medium' color='text.primary'>
            401
          </Typography>
          <Typography variant='h4'>You are not authorized! 🔐</Typography>
          <Typography>You don&#39;t have permission to access this page.</Typography>
        </div>
        {/* <img
          alt='error-illustration'
          src='/images/illustrations/characters/8.png'
          className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px]'
        /> */}
        <div className='flex gap-2'>
          <Button href={getLocalizedUrl(`/login?redirectTo=${'/join/' + searchParams.get('redirectTo')?.split('/')[3]}`, locale as Locale, true)} component={Link} variant='contained'>
            Login
          </Button>
          <Button href={getLocalizedUrl(`/register?redirectTo=${'/join/' + searchParams.get('redirectTo')?.split('/')[3]}`, locale as Locale, true)} component={Link} variant='outlined'>
            Register
          </Button></div>
      </div>
      {/* <Illustrations maskImg={{ src: miscBackground }} /> */}
    </div>
  )
}

export default NotAuthorized
