import { Typography } from '@mui/material'
import type { TypographyProps } from '@mui/material'
import { ForwardRefRenderFunction, forwardRef } from 'react'

const Title: ForwardRefRenderFunction<HTMLLIElement, TypographyProps> = props => {
  const { sx } = props

  return <Typography noWrap {...props} sx={{ wordBreak: 'break-all', wordWrap: 'break-word', ...sx }} />
}

export default forwardRef(Title)
