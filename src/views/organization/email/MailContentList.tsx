// React Imports
import type { Dispatch, MouseEvent, ReactNode, SetStateAction } from 'react'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Backdrop from '@mui/material/Backdrop'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Styles Imports
import styles from './styles.module.css'

// Data Imports
import { labelColors } from './SidebarLeft'
import { OrganizationMail } from '@/types/organization/mail'
import { useEmail } from '@/hooks/useEmail'
import UserAvatar from '@/components/user-avatar'
import { updateMail } from '@/api/organization/email/updateOrganizationMail'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { useOrganization } from '@/hooks/useOrganization'

type Props = {
  isInitialMount: boolean
  isBelowSmScreen: boolean
  isBelowLgScreen: boolean
  reload: boolean
  areFilteredEmailsNone: boolean
  searchTerm: string
  selectedEmails: Set<string>
  emails: OrganizationMail[]
  folder?: string
  setOpenCompose: Dispatch<SetStateAction<boolean>>
  setSelectedEmails: Dispatch<SetStateAction<Set<string>>> // This type has been written to solve type error in this file
  setDrawerOpen: (value: boolean) => void
  handleToggleStarEmail: (e: MouseEvent, id: string) => Promise<void>
  handleSingleEmailDelete: (e: MouseEvent, id: string) => Promise<void>
  handleToggleIsReadStatus: (e: MouseEvent, id: string) => Promise<void>
  setMail: Dispatch<SetStateAction<OrganizationMail | undefined>>
}

const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden relative'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const MailContentList = (props: Props) => {
  // Props
  const {
    isInitialMount,
    isBelowSmScreen,
    isBelowLgScreen,
    reload,
    areFilteredEmailsNone,
    searchTerm,
    selectedEmails,
    emails,
    folder,
    setSelectedEmails,
    setDrawerOpen,
    handleToggleStarEmail,
    handleSingleEmailDelete,
    handleToggleIsReadStatus,
    setOpenCompose,
    setMail
  } = props

  //Hooks
  const { currentEmailId, refreshMail, setCurrentEmailId } = useEmail()
  const user = useUser()
  const { organizationId } = useOrganization()

  // Toggle single selection of email
  const toggleEmailSelected = (emailId: string) => {
    setSelectedEmails(prevSelectedEmails => {
      const newSelectedEmails = new Set(prevSelectedEmails)

      if (newSelectedEmails.has(emailId)) {
        newSelectedEmails.delete(emailId)
      } else {
        newSelectedEmails.add(emailId)
      }

      return newSelectedEmails
    })
  }

  // Move single email to spam
  const handleMoveToSpam = async (e: MouseEvent, id: string) => {
    e.stopPropagation()
    await updateMail(user as UserTable, [id], 'spam')
    refreshMail(user as UserTable, organizationId, folder as string)
  }

  // Handle email click
  const handleEmailClick = async (id: string) => {
    if (currentEmailId !== id || emails.find(email => email._id === id)?.isRead === false) {
      setCurrentEmailId(id)
      await updateMail(user as UserTable, [id], undefined, true)
      refreshMail(user as UserTable, organizationId, folder as string)
    }
    if (folder === 'draft') {
      const mail = emails.find(email => email._id === id)
      setOpenCompose(true)
      setMail(mail)
    } else setDrawerOpen(true)
  }

  return isInitialMount ? (
    <div className='flex items-center justify-center gap-2 grow is-full'>
      <CircularProgress />
      <Typography>Loading...</Typography>
    </div>
  ) : areFilteredEmailsNone ? (
    <div className='relative flex justify-center gap-2 grow is-full'>
      <Typography color='text.primary' className='m-3'>
        No emails found!
      </Typography>
      {reload && (
        <Backdrop open={reload} className='absolute text-white z-10 bg-textDisabled'>
          <CircularProgress color='inherit' />
        </Backdrop>
      )}
    </div>
  ) : (
    <div className='relative overflow-hidden grow is-full'>
      <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
        <div className='flex flex-col'>
          {emails
            .filter(
              email =>
                email.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (
                  email.recipient?.[0]?.nickName?.toLowerCase() ||
                  email.recipient?.[0]?.username?.toLowerCase() ||
                  ''
                ).includes(searchTerm.toLowerCase())
            )
            .map(email => (
              <div
                key={email._id}
                className={classnames('p-4 cursor-pointer', styles.emailList, { 'bg-actionHover': email.isRead })}
                onClick={async () => await handleEmailClick(email._id)}
              >
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 overflow-hidden'>
                    <Checkbox
                      checked={selectedEmails.has(email._id)}
                      onChange={() => toggleEmailSelected(email._id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <IconButton onClick={async e => await handleToggleStarEmail(e, email._id)}>
                      <i
                        className={classnames('ri-star-line', email.isStarred ? 'text-warning' : 'text-textSecondary')}
                      />
                    </IconButton>
                    <UserAvatar
                      userImg={email.recipient?.[0]?.userImg}
                      name={email.recipient?.[0]?.nickName || email.recipient?.[0]?.username}
                      hiddenName
                    />
                    <div className='flex gap-4 justify-between items-center overflow-hidden'>
                      <Typography color='text.primary' className='font-medium whitespace-nowrap'>
                        {email.recipient?.[0]?.nickName || email.recipient?.[0]?.username}
                      </Typography>
                      <Typography variant='body2' noWrap>
                        {email.title}
                      </Typography>
                    </div>
                  </div>
                  {!isBelowSmScreen && (
                    <div
                      className={classnames('flex items-center gap-2', styles.emailInfo, {
                        [styles.show]: isBelowLgScreen
                      })}
                    >
                      <div className='flex items-center gap-2'>
                        {email.labels.map(label => (
                          <i
                            key={label}
                            className={classnames('ri-circle-fill text-[10px]', labelColors[label].colorClass)}
                          />
                        ))}
                      </div>
                      <Typography variant='body2' color='text.disabled' className='whitespace-nowrap'>
                        {new Intl.DateTimeFormat('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }).format(new Date(email.createdAt))}
                      </Typography>
                    </div>
                  )}
                  {!isBelowLgScreen && (
                    <div className={styles.emailActions}>
                      <Tooltip title={folder === 'trash' ? 'Delete' : 'Move to trash'} placement='top'>
                        <IconButton onClick={async e => await handleSingleEmailDelete(e, email._id)}>
                          <i className='ri-delete-bin-7-line text-textSecondary' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={email.isRead ? 'Mark as unread' : 'Mark as read'} placement='top'>
                        <IconButton
                          onClick={async e => {
                            await handleToggleIsReadStatus(e, email._id)
                            setSelectedEmails(new Set())
                          }}
                        >
                          <i
                            className={classnames(
                              'text-textSecondary',
                              email.isRead ? 'ri-mail-unread-line' : 'ri-mail-open-line'
                            )}
                          />
                        </IconButton>
                      </Tooltip>
                      {(folder === 'inbox' || folder === 'trash') && (
                        <Tooltip title='Move to spam' placement='top'>
                          <IconButton onClick={async e => await handleMoveToSpam(e, email._id)}>
                            <i className='ri-error-warning-line text-textSecondary' />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </ScrollWrapper>
      {reload && (
        <Backdrop open={reload} className='absolute text-white z-10 bg-textDisabled'>
          <CircularProgress color='inherit' />
        </Backdrop>
      )}
    </div>
  )
}

export default MailContentList
