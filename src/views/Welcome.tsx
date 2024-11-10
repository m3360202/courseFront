'use client'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

// MUI Imports
import type { TypographyProps } from '@mui/material/Typography'
import Typography from '@mui/material/Typography'

// Type Imports

// import { email } from 'valibot'

import type { BoxProps } from '@mui/material'

import { Box, styled } from '@mui/material'

import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// import { mailList } from '@/utils/mailList'
import { useDictionary } from '@/hooks/useDictionary'

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    width: '100%'
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: 460
  }
}))

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const RegisterV2 = () => {
  // States

  // Hooks
  const { lang: locale } = useParams()
  const dictionary = useDictionary()
  const searchParams = useSearchParams()

  const gotoMail = () => {
    //@ts-ignore
    // const mail = mailList[(email as string).split('@')[2]]

    // window.open(mail)

    // if (!mail) error('The email address is not supported, please log in to the email address manually.')
    // else window.open(mail)
  }

  return (
    <div className='flex bs-full justify-center'>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <Box
            sx={{
              p: 10,
              height: '100%',
              backgroundColor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}
          >
            <BoxWrapper>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>Welcome to xtatic!</TypographyStyled>
              </Box>
              <Box sx={{ mb: 4 }}>
                <TypographyStyled>We have sent the verification email to your email:</TypographyStyled>
              </Box>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled>
                  <Typography color='primary' onClick={gotoMail}>
                    {searchParams.get('email')}
                  </Typography>
                </TypographyStyled>
              </Box>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled>
                  Please click on the verification like in the email and compleate the registration.
                </TypographyStyled>
              </Box>
            </BoxWrapper>
            <Box>
              <Typography component={Link} href={`/login${searchParams.get('redirectTo') ? `?redirectTo=${searchParams.get('redirectTo')}` : ''}`} color='primary'>
                {dictionary.common.signIn}
              </Typography>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  )
}

export default RegisterV2
