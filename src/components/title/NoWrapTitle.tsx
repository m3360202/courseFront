import type { ForwardRefRenderFunction} from 'react';

import { forwardRef } from 'react'

import type { TypographyProps } from '@mui/material';
import { Typography } from '@mui/material'


const NoWrapTitle: ForwardRefRenderFunction<HTMLLIElement, TypographyProps> = props => {
  return <Typography noWrap {...props} />
}

export default forwardRef(NoWrapTitle)
