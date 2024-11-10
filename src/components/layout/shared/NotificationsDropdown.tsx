'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { formatDateToYYYYMMDDHHII } from '@/utils/date'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'

// Type Imports
import type { notificationResponseDataType } from '@/api/notification/notificationMethods'
import { UserTable } from '@/types/user/UserTable'
import { getApplyStatus, NotificationType } from '@/types/notification'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useUser } from '@/hooks/useGlobal'

// Util Imports
import { useGlobal } from '@/hooks/useGlobal'
import UserAvatar from '@/components/user-avatar'
import ApplyConfirmDialog from '@/components/applyConfirm'

// Api Imports
import {
  getNotifications,
  readNotification,
  deleteNotification,
  confirmNotification
} from '@/api/notification/notificationMethods'

import updateGuardian from '@/api/guardian/updateGuardian'
import { updateStudentState } from '@/api/course/updateStudentState'
import { updateInstitutionUser } from '@/api/organization/updateInstitutionUser'
import { success } from '@/utils/toasts'

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const { push } = useRouter()
  const [notificationsState, setNotificationsState] = useState<notificationResponseDataType[]>([])

  // Vars
  const notificationCount = notificationsState.filter(notification => !notification.hasRed).length

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const user = useUser()
  const { lang: locale } = useParams()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { hiddenTabs } = useGlobal()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Read notification when notification is clicked
  const handleReadNotification = async (event: MouseEvent<HTMLElement>, value: boolean, index: number) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications[index].hasRed = value
    await readNotification(user as UserTable, user?._id as string, 'readOne', newNotifications[index]._id)
    setNotificationsState(newNotifications)
  }

  const handleApply = async (item: notificationResponseDataType) => {
    const newNotifications = [...notificationsState]

    const targetIndex = newNotifications.findIndex(notification => notification._id === item._id);

    if (targetIndex !== -1) {
      newNotifications[targetIndex].confirmed = true;
    }
    await confirmNotification(user as UserTable, user?._id as string, item._id)
    if (item.type === 'guardianBind') {

      await updateGuardian(user as UserTable, {
        _id: item.sourceId,
        state: getApplyStatus(NotificationType.GuardianBind).Accept
      })
    }
    if (item.type === 'inviteStudent') {

      await updateStudentState(user as UserTable,
        {
          courseId: item.sourceId,
          studentId: user?._id as string,
          status: getApplyStatus(NotificationType.InviteStudent).Accept
        })
    }
    if (item.type === 'addOrgAdmin' || item.type === 'addOrgTeacher' || item.type === 'addOrgStudent') {

      await updateInstitutionUser(user as UserTable,
        {
          id: item.sourceId,
          studentId: user?._id as string,
          state: getApplyStatus(NotificationType.AddOrgStudent).Accept
        })
    }
    setNotificationsState(newNotifications)
    success('Accept Success!')
  }

  const handleReject = async (item: notificationResponseDataType) => {
    const newNotifications = [...notificationsState]

    newNotifications.filter(notification => notification._id !== item._id);

    if (item.type === 'guardianBind') {

      await updateGuardian(user as UserTable, {
        _id: item.sourceId,
        state: getApplyStatus(NotificationType.GuardianBind).Reject
      })
    }
    if (item.type === 'inviteStudent') {

      await updateStudentState(user as UserTable,
        {
          courseId: item.sourceId,
          studentId: user?._id as string,
          status: getApplyStatus(NotificationType.InviteStudent).Reject
        })
    }
    if (item.type === 'addOrgAdmin' || item.type === 'addOrgTeacher' || item.type === 'addOrgStudent') {

      await updateInstitutionUser(user as UserTable,
        {
          id: item.sourceId,
          studentId: user?._id as string,
          state: getApplyStatus(NotificationType.AddOrgStudent).Reject
        })
    }
    setNotificationsState(newNotifications)
    success('You have already rejected!')
  }

  // Remove notification when close icon is clicked
  const handleRemoveNotification = async (event: MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]
    await deleteNotification(user as UserTable, newNotifications[index]._id)
    newNotifications.splice(index, 1)
    setNotificationsState(newNotifications)
  }

  // Read or unread all notifications when read all icon is clicked
  const readAllNotifications = async () => {
    // const newNotifications = [...notificationsState]

    // newNotifications.forEach(notification => {
    //   notification.hasRed = true
    // })
    // await readNotification(user as UserTable, user?._id as string, 'readAll')
    // setNotificationsState(newNotifications)
    push(getLocalizedUrl(`/notification/${user?._id}`, locale as Locale))
  }

  const handleNotificationJump = (notification: notificationResponseDataType) => {
    if (notification.confirmed) {
      if (notification.type === 'inviteStudent') {
        redirect(getLocalizedUrl(`/course/${notification.sourceId}/detail`, locale as Locale))
      }
      if (notification.type === 'addOrgAdmin' || notification.type === 'addOrgTeacher' || notification.type === 'addOrgStudent') {
        redirect(getLocalizedUrl(`/organization/${notification.sourceId}/main`, locale as Locale))
      }
    }
  }

  const getTitle = (type: string) => {
    if (type === 'guardianBind') {

      return `Guardian Bind`
    }
    if (type === 'inviteStudent') {

      return `Course Invitation`
    }
    if (type === 'addOrgAdmin' || type === 'addOrgTeacher' || type === 'addOrgStudent') {

      return `Institution Invitation`
    }
  }

  const getNotificationContent = (item: notificationResponseDataType, type: string) => {
    if (item && item.content) {
      return item.content;
    } else {
      let content = '';

      if (type === 'guardianBind') {
        content = 'requests to associate your account as a child account';
      } else if (type === 'inviteStudent') {
        content = `invite you to the course <span style="font-size: 14px; color: rgb(32, 146, 236); margin-left: 5px;">${item.sourceName}</span>`;
      } else if (['addOrgAdmin', 'addOrgTeacher', 'addOrgStudent'].includes(type)) {
        content = `invite you to the institution <span style="font-size: 14px; color: rgb(32, 146, 236); margin-left: 5px;">${item.sourceName}</span>`;
      }

      const renderContent = (text: string) => (
        <span dangerouslySetInnerHTML={{ __html: text }} />
      );

      return item.confirmed ? (
        <Box onClick={() => { handleNotificationJump(item); }}>
          <span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginRight: '5px' }}>
            {item.sender.nickName || item.sender.username}
          </span>
          {renderContent(content)}
          <span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginLeft: '10px' }}>
            Click here to accept
            </span>
        </Box>
      ) : (
        <ApplyConfirmDialog
          title='Accept Invitation'
          apply={() => { handleApply(item); }}
          reject={() => { handleReject(item); }}
        >
          <div>
            <span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginRight: '5px' }}>
              {item.sender.nickName || item.sender.username}
            </span>
            {renderContent(`${content}`)}
            <span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginLeft: '10px' }}>
            Click here to accept
            </span>
          </div>
        </ApplyConfirmDialog>
      );
    }
  };

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  const loadNotification = async () => {
    if (user) {
      const data: any = await getNotifications(user, user._id as string)
      setNotificationsState(data)
    }
  }

  useEffect(() => {
    if (user) {
      loadNotification()
    }
  }, [user])

  return hiddenTabs ? (
    <></>
  ) : (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='!text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='ri-notification-2-line' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
            className: 'is-full !mbs-4 z-[1] max-bs-[550px] bs-[550px]',
            modifiers: [
              {
                name: 'preventOverflow',
                options: {
                  padding: themeConfig.layoutPadding
                }
              }
            ]
          }
          : { className: 'is-96 !mbs-4 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-2 pli-4 is-full gap-4'>
                    <Typography variant='h5' className='flex-auto'>
                      Notifications
                    </Typography>
                    {notificationsState.filter(i => i.hasRed === false).length > 0 && (
                      <Chip size='small' variant='tonal' color='primary' label={`${notificationsState.filter(i => i.hasRed === false).length} New`} />
                    )}
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {notificationsState.map((notification, index) => {
                      return (notification.confirmed ? null :
                        <div
                          key={index}
                          className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                            'border-be': index !== notificationsState.length - 1
                          })}
                          onClick={e => { handleReadNotification(e, true, index); }}
                        >

                          <UserAvatar userImg={notification.sender?.userImg} name={notification.sender?.nickName || notification.sender?.username} hiddenName />
                          <div className='flex flex-col flex-auto'>
                            <Typography className='font-medium mbe-1' color='text.primary'>
                              {getTitle(notification.type)}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' className='mbe-2'>
                              {getNotificationContent(notification, notification.type)}
                            </Typography>
                            <Typography variant='caption'>{formatDateToYYYYMMDDHHII(notification.createdAt)}</Typography>
                          </div>
                          <div className='flex flex-col items-end gap-2.5'>
                            <Badge
                              variant='dot'
                              color={notification.hasRed ? 'secondary' : 'primary'}
                              onClick={e => handleReadNotification(e, !notification.hasRed, index)}
                              className={classnames('mbs-1 mie-1', {
                                'invisible group-hover:visible': notification.hasRed
                              })}
                            />
                            <i
                              className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
                              onClick={e => handleRemoveNotification(e, index)}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {(!notificationsState || notificationsState.length === 0) && (
                      <Typography sx={{ margin: '0 auto', marginTop: '160px', textAlign: 'center' }}>There are no notifications at this time.</Typography>
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button fullWidth variant='contained' size='small' onClick={readAllNotifications}>
                      View All Notifications
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade >
        )}

      </Popper>
    </>
  )
}

export default NotificationDropdown
