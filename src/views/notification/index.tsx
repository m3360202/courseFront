'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import { Button, Box, Typography, Chip } from '@mui/material'

// Next Imports
import { redirect, useParams } from 'next/navigation'

// Component Imports
import type { ColumnDef } from '@tanstack/react-table'
import ListTable from '@/components/list-table'
import type { TypeWithAction } from '@/components/list-table/types'
import UserAvatar from '@/components/user-avatar'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import ApplyConfirmDialog from '@/components/applyConfirm'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import format from '@/utils/format'
import { success } from '@/utils/toasts'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'
import { useDictionary } from '@/hooks/useDictionary'

// Api Imports
import {
  getNotifications,
  readNotification,
  confirmNotification
} from '@/api/notification/notificationMethods'
import updateGuardian from '@/api/guardian/updateGuardian'
import { updateStudentState } from '@/api/course/updateStudentState'
import { updateInstitutionUser } from '@/api/organization/updateInstitutionUser'

// Types Imports
import type { notificationResponseDataType } from '@/api/notification/notificationMethods'
import { UserTable } from '@/types/user/UserTable'
import { getApplyStatus, NotificationType } from '@/types/notification'

const NotificationList = () => {
  //Hooks
  const user = useUser()
  const { lang: locale } = useParams()
  const [notificationsState, setNotificationsState] = useState<notificationResponseDataType[]>([])

  const readAllNotifications = async () => {
    const newNotifications = [...notificationsState]

    newNotifications.forEach(notification => {
      notification.hasRed = true
    })
    await readNotification(user as UserTable, user?._id as string, 'readAll')
    setNotificationsState(newNotifications)
  }

  const handleApply = async (item: any) => {
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
    handleReadNotification(item)
    success('Accept Success!')
  }

  const handleReject = async (item: any) => {
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
    handleReadNotification(item)
    success('You have already rejected!')
  }

  const handleReadNotification = async (row: TypeWithAction) => {
    await readNotification(user as UserTable, user?._id as string, 'readOne', row._id)
    const newNotifications = notificationsState.map(notification => {
      if (notification._id === row._id) {

        return { ...notification, hasRed: true }
      }

      return notification
    })

    setNotificationsState(newNotifications);

  }

  const getNotificationComponent = (item: any, type: string, componentType: string) => {
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

      const renderContent = (text: string, componentType: string) => {
        if (componentType === 'content') {

          return (
            <Typography variant='caption' color='text.secondary' className='mbe-2' dangerouslySetInnerHTML={{ __html: text }}>
            </Typography>
          )
        }
        if (componentType === 'avatar') {

          return (
            <UserAvatar
              userImg={item.sender?.userImg}
              name={item.sender?.username}
              email={item.sender?.email}
            />
          )
        }
        if (componentType === 'time') {

          return (
            <NoWrapTitle>{format(item.createdAt)}</NoWrapTitle>
          )
        }
      };

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

      return item.confirmed ? (
        <Box onClick={() => { handleNotificationJump(item); }}>
          {componentType === 'content' && (<span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginRight: '5px' }}>
            {item.sender.nickName || item.sender.username}
          </span>)}
          {renderContent(content, componentType)}
          {componentType === 'content' && (<span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginLeft: '10px' }}>
            Click here to accept
          </span>)}
        </Box>
      ) : (
        <ApplyConfirmDialog
          title='Accept Invitation'
          apply={() => { handleApply(item); }}
          reject={() => { handleReject(item); }}
        >
          <div>
            {componentType === 'content' && (<span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginRight: '5px' }}>
              {item.sender.nickName || item.sender.username}
            </span>)}
            {renderContent(`${content}`, componentType)}
            {componentType === 'content' && (<span style={{ fontSize: '14px', color: 'rgb(32, 146, 236)', marginLeft: '10px' }}>
            Click here to accept
          </span>)}
          </div>
        </ApplyConfirmDialog>
      );
    }
  };

  const getState = (item: notificationResponseDataType) => {
          if(item && !item.confirmed){

            return 'Not Done'
          }else{

            return 'Has Read'
          }
          
  }

  useEffect(() => {
    const loadNotification = async () => {
      if (user) {
        const data: any = await getNotifications(user, user._id as string)
        setNotificationsState(data)
      }
    }
    loadNotification()
  }, [user])

  //Vars
  const dictionary = useDictionary()

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'sender',
      header: dictionary.notification.sender,
      enableSorting: true,
      cell: ({ row }) => (
        <>
          {getNotificationComponent(row.original, row.original.type, 'avatar')}
        </>
      )
    },
    {
      id: 'message',
      header: dictionary.notification.message,
      cell: ({ row }) => (
        <>
          {getNotificationComponent(row.original, row.original.type, 'content')}
        </>
      )
    },
    {
      id: 'createdAt',
      header: dictionary.notification.time,
      cell: ({ row }) => (
        <>
          {getNotificationComponent(row.original, row.original.type, 'time')}
        </>
      )
    },
    {
      id: 'hasRed',
      header: dictionary.notification.status,
      cell: ({ row }) => {
        const state = getState(row.original as notificationResponseDataType)

        return <Chip
          variant='tonal'
          label={state}
          size='small' color={state !== 'Not Done' ? 'success' : 'warning'}
          className='capitalize'
        />
      }
    },
  ]

  const actionButtons = (
    <>
      {
        <Button
          variant='contained'
          onClick={readAllNotifications}
        >Read All</Button>
      }
    </>
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={notificationsState}
          tableColumns={columns}
          actionButtons={actionButtons}
          hasHeader={false}
          handleRowClick={handleReadNotification}
        />
      </Grid>
    </Grid>
  )
}

export default NotificationList
