import type { ForwardRefRenderFunction } from 'react'

import { forwardRef } from 'react'

import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useGlobal'
import { Locale } from '@/configs/i18n'
import sendMessage from '@/utils/sendMessage'

type Props = { contactUserId: string; title?: string }

const ContactButton: ForwardRefRenderFunction<HTMLLIElement, ButtonProps & Props> = props => {
  //Props
  const { contactUserId, title } = props

  //Hooks
  const { push } = useRouter()
  const user = useUser()
  const { lang } = useParams()

  return !user || user?._id === contactUserId ? null : (
    <Button {...props} onClick={async () => await sendMessage(user, contactUserId, lang as Locale, push)}>
      {title || 'Contact'}
    </Button>
  )
}

export default forwardRef(ContactButton)
