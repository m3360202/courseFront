import { Button, Divider, Grid, Menu, Typography } from '@mui/material'
import { ReactNode, cloneElement, isValidElement, useState, MouseEvent } from 'react'

const ApplyConfirmDialog = ({
  title,
  width,
  top,
  apply,
  reject,
  content,
  children
}: {
  title?: string
  width?: number | string
  top?: number | string
  apply: () => Promise<boolean | void> | boolean | void
  reject: () => Promise<boolean | void> | boolean | void
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

  const handleApply = async (event: MouseEvent<HTMLElement>) => {
    const result = await apply()
    if (result !== false) handleClose(event)
  }

  const handleReject = async (event: MouseEvent<HTMLElement>) => {
    const result = await reject()
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
        sx={{marginTop: top ?? 10}}
        onClose={handleClose}
      >
        <Grid container spacing={2} width={width ?? 240}>
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
            <Button onClick={handleReject}>Reject</Button> <Button onClick={handleApply}>Accept</Button>
          </Grid>
        </Grid>
      </Menu>
    </>
  )
}

export default ApplyConfirmDialog