'use client'

// Type Imports
import type { Mode } from '@core/types'

// Util Imports
import RegisterMultiSteps from './auth/register-multi-steps'

const ForgotPasswordV2 = ({ mode }: { mode: Mode }) => {
  // Vars
  console.log(mode)

  // Hooks

  return (
    <RegisterMultiSteps />

    // <div className='flex bs-full justify-center'>
    //   <div
    //     className={classnames(
    //       'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
    //       {
    //         'border-ie': settings.skin === 'bordered'
    //       }
    //     )}
    //   >
    //     <div className='plb-12 pis-12'>
    //       <img
    //         src={characterIllustration}
    //         alt='character-illustration'
    //         className='max-bs-[500px] max-is-full bs-auto'
    //       />
    //     </div>
    //     <Illustrations
    //       image1={{ src: '/images/illustrations/objects/tree-2.png' }}
    //       image2={null}
    //       maskImg={{ src: authBackground }}
    //     />
    //   </div>
    //   <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
    //     <Link
    //       href={getLocalizedUrl('/', locale as Locale)}
    //       className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
    //     >
    //       <Logo />
    //     </Link>
    //     <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
    //       <div>
    //         <Typography variant='h4'>Forgot Password 🔒</Typography>
    //         <Typography className='mbs-1'>
    //           Enter your email and we&#39;ll send you instructions to reset your password
    //         </Typography>
    //       </div>
    //       <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
    //         <TextField autoFocus fullWidth label='Email' />
    //         <Button fullWidth variant='contained' type='submit'>
    //           Send reset link
    //         </Button>
    //         <Typography className='flex justify-center items-center' color='primary'>
    //           <Link href='/login' className='flex items-center'>
    //             <i className='ri-arrow-left-s-line' />
    //             <span>Back to Login</span>
    //           </Link>
    //         </Typography>
    //       </form>
    //     </div>
    //   </div>
    // </div>
  )
}

export default ForgotPasswordV2
