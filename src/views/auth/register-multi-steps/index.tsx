'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepEmailVerify from './StepEmailVerify'
import StepDigitCode from './StepDigitCode'
import StepChangePassword from './StepChangePassword'
import StepperCustomDot from '@components/stepper-dot'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import StepFinished from './StepFinished'
import { useDictionary } from '@/hooks/useDictionary'

export type valueType = {
  email?: string
  code?: string
}

const getStepContent = (
  step: number,
  value: valueType | undefined,
  handleNext: () => void,
  handlePrev: () => void,
  setValue: Dispatch<SetStateAction<valueType | undefined>>
) => {
  switch (step) {
    case 0:
      return <StepEmailVerify handleNext={handleNext} setValue={setValue} />
    case 1:
      return (
        <StepDigitCode
          activeStep={step}
          handleNext={handleNext}
          setValue={setValue}
          handlePrev={handlePrev}
          value={value}
        />
      )
    case 2:
      return <StepChangePassword handlePrev={handlePrev} handleNext={handleNext} value={value} />
    case 3:
      return <StepFinished handlePrev={handlePrev} />
    default:
      return null
  }
}

const RegisterMultiSteps = () => {
  // States
  const [activeStep, setActiveStep] = useState<number>(0)
  const dictionary = useDictionary()
  const [value, setValue] = useState<valueType | undefined>()

  // Vars
  const steps = [
    {
      title: dictionary['common'].email,
      subtitle: dictionary['forgotPassword'].verifyEmail
    },
    {
      title: dictionary['forgotPassword'].code,
      subtitle: dictionary['forgotPassword'].verifyCode
    },
    {
      title: dictionary['common'].password,
      subtitle: dictionary['forgotPassword'].newPwd
    },
    {
      title: dictionary['forgotPassword'].done,
      subtitle: dictionary['forgotPassword'].done
    }
  ]

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()
  const { lang: locale } = useParams()

  // Handle Stepper
  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  return (
    <div className='flex bs-full justify-between items-center'>
      <div
        className={classnames('flex bs-full items-center justify-center is-[594px] max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <img
          src='/images/illustrations/characters/4.png'
          alt='multi-steps-character'
          className={classnames('mis-[92px] bs-auto max-bs-[628px] max-is-full', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </div>
      <div className='flex justify-center items-center bs-full is-full bg-backgroundPaper'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[25px] inline-start-6 sm:inline-start-[25px]'
        >
          <Logo />
        </Link>
        <StepperWrapper className='p-5 sm:p-8 is-[900px]'>
          <Stepper className='mbe-12 mbs-16 sm:mbs-0' activeStep={activeStep}>
            {steps.map((step, index) => {
              return (
                <Step
                  key={index}

                  // onClick={() => setActiveStep(index)}
                >
                  <StepLabel StepIconComponent={StepperCustomDot}>
                    <div className='step-label cursor-pointer'>
                      <Typography className='step-number' color='text.primary'>{`0${index + 1}`}</Typography>
                      <div>
                        <Typography className='step-title' color='text.primary'>
                          {step.title}
                        </Typography>
                        <Typography className='step-subtitle' color='text.primary'>
                          {step.subtitle}
                        </Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
          {getStepContent(activeStep, value, handleNext, handlePrev, setValue)}
        </StepperWrapper>
      </div>
    </div>
  )
}

export default RegisterMultiSteps
