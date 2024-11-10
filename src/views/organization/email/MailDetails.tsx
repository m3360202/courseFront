// React Imports
import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import OptionMenu from '@core/components/option-menu'
import DirectionalIcon from '@components/DirectionalIcon'
import MailCard from './MailCard'

// Data Imports
import { labelColors } from './SidebarLeft'
import { OrganizationMail } from '@/types/organization/mail'
import { useEmail } from '@/hooks/useEmail'
import { useOrganization } from '@/hooks/useOrganization'
import { updateMail } from '@/api/organization/email/updateOrganizationMail'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import draftToHtml from 'draftjs-to-html'
import { error, success } from '@/utils/toasts'
import { addMail } from '@/api/organization/email/addOrganizationMail'
import { sendMail } from '@/api/sendMail'
import { LoadingButton } from '@mui/lab'
import Editor from '@/components/editor'

type Props = {
  drawerOpen: boolean
  setDrawerOpen: (value: boolean) => void
  currentEmail?: OrganizationMail
  isBelowSmScreen: boolean
  isBelowLgScreen: boolean
  emails: OrganizationMail[]
  folder?: string
  label?: string
  handleSingleEmailDelete: (e: MouseEvent, emailIds: string) => void
  handleToggleIsReadStatus: (e: MouseEvent, emailId: string) => void
  handleToggleStarEmail: (e: MouseEvent, emailId: string) => void
}

const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden bg-actionHover'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bg-actionHover' options={{ wheelPropagation: false }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const DetailsDrawer = styled('div')<{ drawerOpen: boolean }>(({ drawerOpen }) => ({
  display: 'flex',
  flexDirection: 'column',
  blockSize: '100%',
  inlineSize: '100%',
  position: 'absolute',
  top: 0,
  right: drawerOpen ? 0 : '-100%',
  zIndex: 11,
  overflow: 'hidden',
  background: 'var(--mui-palette-background-paper)',
  transition: 'right 0.3s ease'
}))

const MailDetails = (props: Props) => {
  // Props
  const {
    drawerOpen,
    setDrawerOpen,
    isBelowLgScreen,
    currentEmail,
    emails,
    folder,
    label,
    handleSingleEmailDelete,
    handleToggleIsReadStatus,
    handleToggleStarEmail
  } = props

  // States
  const [reply, setReply] = useState(false)
  const editorState = EditorState.createEmpty()
  const [value, setContentValue] = useState<any>(editorState)
  const [sendLoading, setSendLoading] = useState(false)

  //Hooks
  const { currentEmailId, refreshMail, setCurrentEmailId } = useEmail()
  const { organizationId } = useOrganization()
  const user = useUser()

  // Handle navigation between emails and reset reply state
  const handleEmailNavigation = (type: 'next' | 'prev') => {
    const currentIndex = emails?.findIndex((email: OrganizationMail) => email._id === currentEmail?._id)

    if (type === 'next' && currentIndex < emails?.length - 1) {
      setCurrentEmailId(emails[currentIndex + 1]._id)
    } else if (type === 'prev' && currentIndex > 0) {
      setCurrentEmailId(emails[currentIndex - 1]._id)
    }

    // Mark email as read on navigation
    if (currentEmailId) {
      //state.emails.filter(email => email.id === state.currentEmailId)[0].isRead = true
    }

    //dispatch(navigateEmails({ type, emails, currentEmailId: currentEmail?.id }))

    if (reply) {
      setReply(false)
    }
  }

  // Close drawer and reset reply state
  const handleCloseDrawer = () => {
    setDrawerOpen(false)

    if (reply) {
      setReply(false)
    }
  }

  // Move all selected emails to spam
  const handleMoveAllToSpam = async () => {
    //dispatch(moveEmailsToFolder({ emailIds: [currentEmail?.id], folder: 'spam' }))
    await updateMail(user as UserTable, [currentEmail?._id as string], 'spam')
    refreshMail(user as UserTable, organizationId, folder as string)
    setDrawerOpen(false)
  }

  // Move all selected emails to inbox
  const handleMoveAllToInbox = async () => {
    //dispatch(moveEmailsToFolder({ emailIds: [currentEmail?.id], folder: 'inbox' }))
    await updateMail(user as UserTable, [currentEmail?._id as string], 'inbox')
    refreshMail(user as UserTable, organizationId, folder as string)
    setDrawerOpen(false)
  }

  // Handle click on label option from menu list
  const handleLabelClick = async (value: string) => {
    //dispatch(toggleLabel({ emailIds: [currentEmail?.id], label: value }))
    await updateMail(user as UserTable, [currentEmail?._id as string], undefined, undefined, value)
    refreshMail(user as UserTable, organizationId, folder as string)
    label === value && setDrawerOpen(false)
  }

  const send = async () => {
    if (!value.getCurrentContent().hasText()) {
      error('Please input message!')

      return
    }

    const message = draftToHtml(
      convertToRaw(
        EditorState.createWithContent(convertFromRaw(convertToRaw(value.getCurrentContent()))).getCurrentContent()
      )
    )
    const messageObj = convertToRaw(value?.getCurrentContent())
    try {
      const title = `Reply to ${currentEmail?.postedByUser?.nickName || currentEmail?.postedByUser?.username}`
      setSendLoading(true)
      await addMail(
        user as UserTable,
        currentEmail?.recipient?.map(item => item._id) as string[],
        title,
        message,
        messageObj,
        organizationId
      )
      await sendMail(user as UserTable, {
        to: [{ userId: currentEmail?.postedByUser._id as string, to: currentEmail?.postedByUser?.email as string }],
        title,
        message,
        instructorId: organizationId
      })
      setSendLoading(false)
      success('The email has been sent out!')
    } catch { }
  }

  return (
    <DetailsDrawer drawerOpen={drawerOpen}>
      {currentEmail && (
        <>
          <div className='plb-4 pli-5'>
            <div className='flex justify-between gap-2'>
              <div className='flex gap-2 items-center overflow-hidden'>
                <IconButton onClick={handleCloseDrawer}>
                  <DirectionalIcon
                    ltrIconClass='ri-arrow-left-s-line'
                    rtlIconClass='ri-arrow-right-s-line'
                    className='text-textPrimary'
                  />
                </IconButton>
                <div className='flex items-center flex-wrap gap-2 overflow-hidden'>
                  <Typography color='text.primary' noWrap>
                    {currentEmail.title}
                  </Typography>
                  <div className='flex items-center flex-wrap gap-2'>
                    {currentEmail.labels && currentEmail.labels.length
                      ? currentEmail.labels.map(label => {
                        return (
                          <Chip
                            key={label}
                            variant='tonal'
                            size='small'
                            label={label}
                            color={labelColors[label].color}
                            className='capitalize'
                          />
                        )
                      })
                      : null}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <IconButton disabled={currentEmail._id === emails[0]._id} onClick={() => handleEmailNavigation('prev')}>
                  <DirectionalIcon
                    ltrIconClass='ri-arrow-left-s-line'
                    rtlIconClass='ri-arrow-right-s-line'
                    className='text-textSecondary'
                  />
                </IconButton>
                <IconButton
                  disabled={currentEmail._id === emails[emails.length - 1]._id}
                  onClick={() => handleEmailNavigation('next')}
                >
                  <DirectionalIcon
                    ltrIconClass='ri-arrow-right-s-line'
                    rtlIconClass='ri-arrow-left-s-line'
                    className='text-textSecondary'
                  />
                </IconButton>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between gap-4 plb-2 pli-5 border-y text-textSecondary'>
            <div className='flex gap-1'>
              <Tooltip title={folder === 'trash' ? 'Delete' : 'Move to trash'} placement='top'>
                <IconButton
                  onClick={e => {
                    setDrawerOpen(false)
                    handleSingleEmailDelete(e, currentEmail._id)
                  }}
                >
                  <i className='ri-delete-bin-7-line text-textSecondary' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Mark as unread' placement='top'>
                <IconButton
                  onClick={e => {
                    setDrawerOpen(false)
                    handleToggleIsReadStatus(e, currentEmail._id)
                  }}
                >
                  <i className='ri-mail-unread-line text-textSecondary' />
                </IconButton>
              </Tooltip>
              {folder === 'inbox' && (
                <Tooltip title='Move to spam' placement='top'>
                  <IconButton onClick={handleMoveAllToSpam}>
                    <i className='ri-error-warning-line text-textSecondary' />
                  </IconButton>
                </Tooltip>
              )}
              {folder === 'spam' && (
                <Tooltip title='Move to inbox' placement='top'>
                  <IconButton onClick={handleMoveAllToInbox}>
                    <i className='ri-inbox-line text-textSecondary' />
                  </IconButton>
                </Tooltip>
              )}
              {folder === 'trash' && (
                <OptionMenu
                  tooltipProps={{ title: 'Move to folder', placement: 'top' }}
                  icon={<i className='ri-folder-3-line text-textSecondary' />}
                  iconButtonProps={{ size: 'medium' }}
                  options={[
                    {
                      text: 'Spam',
                      icon: <i className='ri-error-warning-line mie-2' />,
                      menuItemProps: { onClick: handleMoveAllToSpam }
                    },
                    {
                      text: 'Inbox',
                      icon: <i className='ri-inbox-line mie-2' />,
                      menuItemProps: { onClick: handleMoveAllToInbox }
                    }
                  ]}
                />
              )}
              <OptionMenu
                tooltipProps={{ title: 'Toggle label', placement: 'top' }}
                icon={<i className='ri-price-tag-3-line text-textSecondary' />}
                iconButtonProps={{ size: 'medium' }}
                options={Object.entries(labelColors).map(([key, value]) => ({
                  text: key.charAt(0).toUpperCase() + key.slice(1),
                  menuItemProps: { onClick: async () => await handleLabelClick(key) },
                  icon: <i className={`ri-circle-fill mie-2 text-xs text-${value.color}`} />
                }))}
              />
            </div>
            <div className='flex gap-1'>
              <IconButton
                onClick={e => {
                  handleToggleStarEmail(e, currentEmail._id)
                  folder === 'starred' && setDrawerOpen(false)
                }}
              >
                <i
                  className={classnames('ri-star-line', currentEmail.isStarred ? 'text-warning' : 'text-textSecondary')}
                />
              </IconButton>
              {/* {currentEmail.replies.length ? (
                <IconButton onClick={() => setShowReplies(!showReplies)}>
                  <i
                    className={classnames('text-textSecondary', {
                      'ri-expand-height-line': !showReplies,
                      'ri-contract-up-down-line': showReplies
                    })}
                  />
                </IconButton>
              ) : null} */}
              {/* <IconButton>
                <i className='ri-more-2-line text-textSecondary' />
              </IconButton> */}
            </div>
          </div>
          <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
            <div className='plb-5 pli-8 flex flex-col gap-4'>
              {/* {currentEmail.replies.length && !showReplies ? (
                <Typography
                  variant='body1'
                  color='text.secondary'
                  className='self-center text-center cursor-pointer'
                  onClick={() => setShowReplies(true)}
                >
                  {`${currentEmail.replies.length} Earlier Messages`}
                </Typography>
              ) : null}
              {showReplies
                ? currentEmail.replies.map(reply => <MailCard key={reply.id} data={reply} isReplies={false} />)
                : null} */}

              <div>
                {/* {!showReplies && currentEmail.replies.length ? (
                  <>
                    <div
                      className={classnames(styles.mailReplyLayer, styles.layer1)}
                      onClick={() => setShowReplies(true)}
                    />
                    <div
                      className={classnames(styles.mailReplyLayer, styles.layer2)}
                      onClick={() => setShowReplies(true)}
                    />
                  </>
                ) : null} */}
                <MailCard data={currentEmail} />
                <Card className='border mbs-4'>
                  {!reply ? (
                    <CardContent>
                      <Typography>
                        Click here to
                        <span className='text-primary cursor-pointer mli-1' onClick={() => setReply(true)}>
                          Reply
                        </span>
                      </Typography>
                    </CardContent>
                  ) : (
                    <div className='flex flex-col gap-y-6'>
                      <CardContent className='pbe-0'>
                        <Typography color='text.primary'>{`Reply to ${currentEmail?.postedByUser?.nickName || currentEmail?.postedByUser?.username}`}</Typography>
                      </CardContent>
                      <div className='pl-4 pr-4'>
                        <Editor user={user as UserTable} value={value} setContentValue={setContentValue} />
                      </div>
                      <CardActions className='pbs-0'>
                        <div className='flex items-center justify-end gap-4'>
                          <IconButton>
                            <i className='ri-delete-bin-7-line text-textSecondary' onClick={() => setReply(false)} />
                          </IconButton>
                          <LoadingButton
                            loading={sendLoading}
                            variant='contained'
                            color='primary'
                            endIcon={<i className='ri-send-plane-line' />}
                            onClick={send}
                          >
                            Send
                          </LoadingButton>
                        </div>
                      </CardActions>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </ScrollWrapper>
        </>
      )}
    </DetailsDrawer>
  )
}

export default MailDetails
