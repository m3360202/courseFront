import { Button, Divider, Grid, Menu, Typography } from '@mui/material'
import { ReactNode, cloneElement, isValidElement, useState, MouseEvent } from 'react'

const ConfirmDialog = ({
  title,
  width,
  top,
  confirm,
  content,
  children
}: {
  title?: string
  width?: number | string
  top?: number | string
  confirm: () => Promise<boolean | void> | boolean | void
  children: ReactNode
  content?: JSX.Element
}) => {
  //States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // clone children and add onClick event
  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement, {
        onClick: (event: MouseEvent<HTMLElement>) => {
          event.stopPropagation()
          setAnchorEl(event.currentTarget)
        }
      })
    : children

  const handleClose = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(null)
  }

  const handleClick = async (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    const result = await confirm()
    if (result !== false) handleClose(event)
  }

  return (
    <>
      {childrenWithProps}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 35, horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={open}
        sx={{ marginTop: top ?? 0 }}
        onClose={handleClose}
      >
        <Grid container spacing={2} sx={{ width: width || 240 }}>
          <Grid item xs={12} textAlign={'center'}>
            <Typography fontWeight={600} sx={{ padding: '5px' }}>
              {title || 'Delete'}
              {!content && '?'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {content && (
            <Grid item xs={12} textAlign={'center'} m={4}>
              {content}
            </Grid>
          )}

          <Grid item xs={12} textAlign={'center'}>
            <Button onClick={handleClose}>Cancel</Button> <Button onClick={handleClick}>Confirm</Button>
          </Grid>
        </Grid>
      </Menu>
    </>
  )
}

export default ConfirmDialog
