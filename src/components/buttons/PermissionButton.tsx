import type { ForwardRefRenderFunction, ReactNode } from 'react'

import { forwardRef } from 'react'

import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'

type Props = { text: string; children?: never } | { text?: never; children: ReactNode }

const PermissionButton: ForwardRefRenderFunction<
  HTMLLIElement,
  ButtonProps & { isShow: boolean | undefined } & Props
> = props => {
  const { isShow, text, children } = props
  if (!isShow) return <></>

  return text ? <Button {...props}>{text}</Button> : children
}

export default forwardRef(PermissionButton)
