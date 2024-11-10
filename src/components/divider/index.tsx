import type { ReactNode } from 'react'

import { Divider } from '@mui/material'
import { TextAlign } from '@/types'

export const CustomDivider = ({
  textAlign = TextAlign.Left,
  children
}: {
  textAlign?: TextAlign
  children: ReactNode
}) => (
  <Divider textAlign={textAlign} sx={textAlign === TextAlign.Left ? { '&::before': { width: 'inherit' } } : undefined}>
    {children}
  </Divider>
)
