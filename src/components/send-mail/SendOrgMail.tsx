import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import Editor from '@/components/editor'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import draftToHtml from 'draftjs-to-html'
import { LoadingButton } from '@mui/lab'
import { error, success } from '@/utils/toasts'
import { useUser } from '@/hooks/useGlobal'
import UserAvatar from '../user-avatar'
import { CustomButton } from '../editor/CustomButton'
import { sendMail } from '@/api/sendMail'
import { UserTable } from '@/types/user/UserTable'
import { useOrganization } from '@/hooks/useOrganization'
import delay from '@/utils/delay'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { addMail, editMail } from '@/api/organization/email/addOrganizationMail'
import { OrganizationMail } from '@/types/organization/mail'

export default function SendOrgMail({
  selectValue,
  needDraft,
  mail,
  folder,
  refreshMail,
  setOpen
}: {
  setOpen?: Dispatch<SetStateAction<boolean>>
  selectValue?: UserTable[]
  needDraft?: boolean
  mail?: OrganizationMail
  folder?: string
  refreshMail?: (user: UserTable, organizationId: string, folder: string, label?: string | undefined) => Promise<void>
}) {
  //States
  const [title, setTitle] = useState<string>()
  const editorState = EditorState.createEmpty()
  const [value, setContentValue] = useState<any>(editorState)
  const [data, setData] = useState<UserTable[]>()
  const [defaulValue, setDefaultValue] = useState<UserTable[] | undefined>(selectValue)
  const [sendLoading, setSendLoading] = useState(false)

  //Hooks
  const user = useUser()
  const { organization } = useOrganization()
  const { push } = useRouter()
  const { lang, organizationId } = useParams()

  useEffect(() => {
    organization && setData(organization?.platformUsers?.filter(c => c.state === 1)?.map(u => u.userId as UserTable))
  }, [organization])

  useEffect(() => {
    if (mail) {
      setTitle(mail.title)
      setContentValue(
        EditorState.createWithContent(
          convertFromRaw({
            entityMap: mail?.messageObj?.entityMap || {},
            blocks: mail?.messageObj?.blocks || []
          })
        )
      )
    }
  }, [mail])

  const sendMailValid = async (isDrfat?: boolean) => {
    if (!defaulValue || defaulValue.length === 0) {
      error('Please select user!')

      return
    }
    if (!title) {
      error('Please input title!')

      return
    }
    if (!value.getCurrentContent().hasText()) {
      error('Please input message!')

      return
    }
    send(isDrfat)
  }

  const send = async (isDrfat?: boolean) => {
    const message = draftToHtml(
      convertToRaw(
        EditorState.createWithContent(convertFromRaw(convertToRaw(value.getCurrentContent()))).getCurrentContent()
      )
    )
    const messageObj = convertToRaw(value?.getCurrentContent())
    const dv = defaulValue || []
    const toUsers = dv.map(item => {
      return {
        userId: item._id,
        to: item.email
      }
    }) as any
    try {
      setSendLoading(true)
      if (mail)
        await editMail(
          user as UserTable,
          mail._id,
          toUsers.map((u: any) => u.userId) as string[],
          title as string,
          message,
          messageObj,
          isDrfat ? 'draft' : 'sent'
        )
      else
        await addMail(
          user as UserTable,
          toUsers.map((u: any) => u.userId) as string[],
          title as string,
          message,
          messageObj,
          organization?._id as string,
          isDrfat ? 'draft' : 'sent'
        )
      if (!isDrfat) {
        await sendMail(user as UserTable, {
          to: toUsers,
          title: title as string,
          message,
          instructorId: organization?._id
        })
      }
      if (refreshMail && folder) refreshMail(user as UserTable, organizationId as string, folder)
      setOpen && setOpen(false)
      setSendLoading(false)
      success(isDrfat ? 'The email saved as draft' : 'The email has been sent out!')
      if (!setOpen)
        delay(() => {
          push(getLocalizedUrl(`/organization/${organization?._id}/detail/email`, lang as Locale))
        }, 500)
    } catch { }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} display={'flex'} alignItems={'center'}>
        <Typography variant='h6' width={100}>
          Send to
        </Typography>
        <Autocomplete
          options={data || []}
          defaultValue={defaulValue}
          multiple
          fullWidth
          // filterOptions={x =>
          //   x.filter(c =>
          //     !searchValue
          //       ? true
          //       : //@ts-ignore
          //         c.username?.toLowerCase().includes(searchValue.toLowerCase()) ||
          //         //@ts-ignore
          //         c.nickName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          //         //@ts-ignore
          //         c.email?.toLowerCase().includes(searchValue.toLowerCase())
          //   )
          // }
          autoHighlight
          //@ts-ignore
          getOptionLabel={
            option => option.nickName || option.username
            //@ts-ignore
            //showName(option.username, option.nickName) as string
          }
          renderOption={(props, option) => (
            <Box component='li' {...props} sx={{ display: 'none' }}>
              <UserAvatar name={option.nickName || option.username} userImg={option.userImg} />
            </Box>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label=''
              variant='standard'
              inputProps={{
                ...params.inputProps
              }}
            />
          )}
          onChange={(e: any, value: UserTable[]) => {
            setDefaultValue(value)
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12} display={'flex'} alignItems={'baseline'}>
        <Typography variant='h6' width={100}>
          Subject
        </Typography>
        <FormControl fullWidth sx={{ m: 1 }} variant='standard'>
          <Input
            value={title}
            startAdornment={
              <InputAdornment position='start'>{organization?.name ? organization?.name + '-' : ''}</InputAdornment>
            }
            onChange={e => {
              setTitle(e.target.value)
            }}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h6'>Message</Typography>
      </Grid>
      <Grid item xs={12}>
        <Editor
          placeholder='Message'
          user={user as UserTable}
          value={value}
          setContentValue={setContentValue}
          toolbarCustomButtons={[<CustomButton key={'var'} />]}
        />
      </Grid>
      <Grid item xs={12} className='flex justify-center gap-4' mt={10}>
        {needDraft && (
          <LoadingButton
            variant='contained'
            loading={sendLoading}
            endIcon={<i className='ri-draft-line' />}
            onClick={async () => await sendMailValid(true)}
          >
            Save as draft
          </LoadingButton>
        )}
        <LoadingButton
          variant='contained'
          endIcon={<i className='ri-send-plane-line' />}
          loading={sendLoading}
          onClick={async () => await sendMailValid()}
        >
          Send
        </LoadingButton>
      </Grid>
    </Grid>
  )
}
