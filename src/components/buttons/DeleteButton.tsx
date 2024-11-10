import { CircularProgress, IconButton } from '@mui/material'
import { ForwardRefRenderFunction, ReactNode, forwardRef } from 'react'
import type { ButtonProps } from '@mui/material'

const DeleteButton: ForwardRefRenderFunction<
  HTMLLIElement,
  ButtonProps & { loading?: boolean; condition?: boolean; children?: ReactNode }
> = props => {
  const { loading, condition, children } = props

  return loading && condition ? (
    <CircularProgress size={20} />
  ) : (
    children || (
      <IconButton {...props}>
        <i className='ri-delete-bin-7-line text-textSecondary' />
      </IconButton>
    )
  )
}

export default forwardRef(DeleteButton)
