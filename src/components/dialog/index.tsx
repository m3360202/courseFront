// React Imports
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { isValidElement, cloneElement } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { IconButton, type SxProps, type Theme } from '@mui/material'

const TargetDialog = ({
  title,
  content,
  actions,
  open,
  setOpen,
  width,
  height,
  sx,
  children
}: {
  title: string
  content: JSX.Element
  actions?: JSX.Element
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  width?: number | string
  height?: number | string
  sx?: SxProps<Theme>
  children?: ReactNode
}) => {
  // States

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  // clone children and add onClick event
  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement, {
        onClick: () => {
          if (children.props.onClick) children.props.onClick()
          handleClickOpen()
        }
      })
    : children

  return (
    <>
      {childrenWithProps}
      <Dialog
        sx={{
          ...sx,
          '& .MuiPaper-root': {
            borderRadius: '16px',
            minWidth: width || '40%',
            minHeight: height || 500
          }
        }}
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={open}
      >
        <DialogTitle id='customized-dialog-title' className='p-4'>
          <Typography variant='h6' component='span'>
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent dividers className='p-4'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          {content}
        </DialogContent>
        {actions && <DialogActions className='p-4 !pt-4 flex justify-center'>{actions}</DialogActions>}
      </Dialog>
    </>
  )
}

export default TargetDialog
