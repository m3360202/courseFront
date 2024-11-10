// React Imports
import { useState } from 'react'
import type { Dispatch, MouseEvent, SetStateAction } from 'react'

// Component Imports
import MailContentSearch from './MailContentSearch'
import MailContentActions from './MailContentActions'
import MailContentList from './MailContentList'
import MailDetails from './MailDetails'
import { useEmail } from '@/hooks/useEmail'
import { updateMail } from '@/api/organization/email/updateOrganizationMail'
import { UserTable } from '@/types/user/UserTable'
import { useOrganization } from '@/hooks/useOrganization'
import { useUser } from '@/hooks/useGlobal'
import { deleteMail } from '@/api/organization/email/deleteOrganizationMail'
import { OrganizationMail } from '@/types/organization/mail'

type Props = {
  folder?: string
  label?: string
  uniqueLabels: string[]
  isInitialMount: boolean
  setSidebarOpen: (value: boolean) => void
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
  setBackdropOpen: (value: boolean) => void
  setOpenCompose: Dispatch<SetStateAction<boolean>>
  setMail: Dispatch<SetStateAction<OrganizationMail | undefined>>
}

const MailContent = (props: Props) => {
  // Props
  const {
    folder,
    label,
    uniqueLabels,
    isInitialMount,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    setBackdropOpen,
    setOpenCompose,
    setMail
  } = props

  // States
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reload, setReload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  //Hooks
  const { mails, currentEmailId, refreshMail } = useEmail()
  const { organizationId } = useOrganization()
  const user = useUser()

  // Vars
  const emails = mails || []
  const currentEmail = emails.find(email => email._id === currentEmailId)

  const areFilteredEmailsNone =
    emails.length === 0 ||
    emails.filter(
      email =>
        email.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (email.recipient?.[0]?.nickName?.toLowerCase() || email.recipient?.[0]?.username?.toLowerCase() || '').includes(
          searchTerm.toLowerCase()
        )
    ).length === 0

  // Action for deleting single email
  const handleSingleEmailDelete = async (e: MouseEvent, emailId: string) => {
    e.stopPropagation()
    setSelectedEmails(prevSelectedEmails => {
      const newSelectedEmails = new Set(prevSelectedEmails)

      newSelectedEmails.delete(emailId)

      return newSelectedEmails
    })

    if (folder === 'trash') {
      await deleteMail(user as UserTable, [emailId])
      refreshMail(user as UserTable, organizationId, folder as string)
      //dispatch(deleteTrashEmails({ emailIds: [emailId] }))
    } else {
      await updateMail(user as UserTable, [emailId], 'trash')
      refreshMail(user as UserTable, organizationId, folder as string)
      //dispatch(moveEmailsToFolder({ emailIds: [emailId], folder: 'trash' }))
    }
  }

  // Toggle read status for single email
  const handleToggleIsReadStatus = async (e: MouseEvent, id: string) => {
    e.stopPropagation()
    await updateMail(user as UserTable, [id], undefined, !mails?.find(c => c._id === id)?.isRead)
    refreshMail(user as UserTable, organizationId, folder as string)
    //dispatch(toggleReadEmails({ emailIds: [id] }))
  }

  // Toggle star for single email
  const handleToggleStarEmail = async (e: MouseEvent, id: string) => {
    e.stopPropagation()
    const isStarred = emails.find(c => c._id === id)?.isStarred
    await updateMail(user as UserTable, [id], undefined, undefined, undefined, !isStarred)
    refreshMail(user as UserTable, organizationId, folder as string)
    //dispatch(toggleStarEmail({ emailId: id }))
  }

  return (
    <div className='flex flex-col items-center justify-center is-full bs-full relative overflow-hidden bg-backgroundPaper'>
      <MailContentSearch
        isBelowScreen={isBelowMdScreen}
        searchTerm={searchTerm}
        setSidebarOpen={setSidebarOpen}
        setBackdropOpen={setBackdropOpen}
        setSearchTerm={setSearchTerm}
      />
      <MailContentActions
        areFilteredEmailsNone={areFilteredEmailsNone}
        selectedEmails={selectedEmails}
        setSelectedEmails={setSelectedEmails}
        emails={emails}
        folder={folder}
        label={label}
        uniqueLabels={uniqueLabels}
        setReload={setReload}
      />
      <MailContentList
        isInitialMount={isInitialMount}
        isBelowSmScreen={isBelowSmScreen}
        isBelowLgScreen={isBelowLgScreen}
        reload={reload}
        areFilteredEmailsNone={areFilteredEmailsNone}
        searchTerm={searchTerm}
        selectedEmails={selectedEmails}
        emails={emails}
        folder={folder}
        setSelectedEmails={setSelectedEmails}
        setDrawerOpen={setDrawerOpen}
        handleToggleStarEmail={handleToggleStarEmail}
        handleSingleEmailDelete={handleSingleEmailDelete}
        handleToggleIsReadStatus={handleToggleIsReadStatus}
        setOpenCompose={setOpenCompose}
        setMail={setMail}
      />
      <MailDetails
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        isBelowSmScreen={isBelowSmScreen}
        isBelowLgScreen={isBelowLgScreen}
        currentEmail={currentEmail}
        emails={emails}
        folder={folder}
        label={label}
        handleSingleEmailDelete={handleSingleEmailDelete}
        handleToggleIsReadStatus={handleToggleIsReadStatus}
        handleToggleStarEmail={handleToggleStarEmail}
      />
    </div>
  )
}

export default MailContent
