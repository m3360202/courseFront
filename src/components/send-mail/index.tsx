import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Input,
  Menu,
  TextField,
  Typography
} from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useState, MouseEvent } from 'react'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import Editor from '@/components/editor'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import draftToHtml from 'draftjs-to-html'
import { LoadingButton } from '@mui/lab'
import { Student, StatusList } from '@/types/course/student'
import { GuradianParent } from '@/types/course/guradian'
import { error, success } from '@/utils/toasts'
import { useUser } from '@/hooks/useGlobal'
import UserAvatar from '../user-avatar'
import { CustomButton } from '../editor/CustomButton'
import { getParents } from '@/api/course/getParents'
import { sendMail } from '@/api/sendMail'
import { UserTable } from '@/types/user/UserTable'

export default function SendMail({
  students,
  statusList,
  selectValue,
  setOpen
}: {
  setOpen: Dispatch<SetStateAction<boolean>>
  students?: Student[]
  statusList?: StatusList[]
  selectValue?: Student[]
}) {
  //States
  const [parentChecked, setParentChecked] = useState<boolean>(false)
  const [status, setStatus] = useState<string[]>()
  const [title, setTitle] = useState<string>()
  const editorState = EditorState.createEmpty()
  const [value, setContentValue] = useState<any>(editorState)
  const [data, setData] = useState<Student[]>([])
  const [defaulValue, setDefaultValue] = useState<Student[]>([])
  const [parents, setParents] = useState<GuradianParent[]>([])
  const [parentList, setParentList] = useState<Student[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isDelete, setIsDelete] = useState<boolean>(false)
  const [key, setKey] = useState<string>('')
  const [sendLoading, setSendLoading] = useState(false)
  const [loadParentsLoading, sendLoadParentLoading] = useState(false)

  //Hooks
  const user = useUser()

  const rowOptionsOpen = Boolean(anchorEl)
  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleRowOptionsClose = (e: any) => {
    setAnchorEl(null)
    e.stopPropagation()
  }

  useEffect(() => {
    setData(students || [])
  }, [students])

  useEffect(() => {
    setDefaultValue(
      (students?.filter(c => status?.includes(c.status as string)) || []).concat(selectValue ? selectValue : [])
    )
  }, [status, parentChecked])

  useEffect(() => {
    setKey(new Date().getTime().toString())
  }, [defaulValue, parentList])

  useEffect(() => {
    if (parents && parents.length > 0) {
      const pv: any = []
      parents.map(parent => {
        pv.push({ ...parent.userId })
      })
      setParentList(pv)
    } else {
      setParentList([])
    }
  }, [parents])

  useEffect(() => {
    const loadParents = async () => {
      let userIds: string[] = students?.map(item => item._id) as string[]
      if (status !== undefined) userIds = defaulValue.map(item => item._id) as string[]
      if (parentChecked && user) {
        sendLoadParentLoading(true)
        const { data } = await getParents(user, userIds)
        setParents(data)
        sendLoadParentLoading(false)
      } else {
        setParents([])
      }
    }
    !isDelete && loadParents()
  }, [parentChecked, status, defaulValue])

  const handleChangeStatus = (value: string, checked: boolean) => {
    const statusValue = status?.concat([]) || []
    const parseValue = value
    if (checked && statusValue.find(c => c === parseValue) === undefined) statusValue.push(parseValue)
    else if (!checked && statusValue.find(c => c === parseValue) !== undefined) {
      const index = statusValue.findIndex(c => c === parseValue)
      statusValue.splice(index, 1)
    }
    // const emailList = students?.filter(c => statusValue.includes(c.status)) || []
    // setDefaultValue(emailList)
    setStatus(statusValue)
    setIsDelete(false)
  }

  const sendMailValid = async (e: any) => {
    if ((!defaulValue || defaulValue.length === 0) && (!parentList || parentList.length === 0)) {
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
    handleRowOptionsClick(e)
  }
  const send = async () => {
    const message = draftToHtml(
      convertToRaw(
        EditorState.createWithContent(convertFromRaw(convertToRaw(value.getCurrentContent()))).getCurrentContent()
      )
    )
    const dv = defaulValue?.concat(parentList || []) || []
    const toUsers = dv.map(item => {
      return {
        userId: item._id,
        to: item.email
      }
    }) as any
    toUsers.push({
      userId: user?._id,
      to: user?.email
    })
    try {
      setSendLoading(true)
      await sendMail(user as UserTable, {
        to: toUsers,
        title: title as string,
        message
      })
      setOpen(false)
      setSendLoading(false)
      success('The email has been sent out!')
    } catch { }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} display={'flex'} alignItems={'center'}>
        <Typography variant='h6' width={100}>
          Status
        </Typography>
        <FormControl fullWidth sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
          <FormGroup row>
            {statusList?.map(s => (
              <FormControlLabel
                key={s._id}
                value={s._id}
                control={
                  <Checkbox
                    onChange={(e, c) => {
                      handleChangeStatus(e.target.value, c)
                    }}
                  />
                }
                label={s.title}
              />
            ))}
          </FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                onChange={(e, c) => {
                  setParentChecked(c)
                  setIsDelete(false)
                }}
              />
            }
            label='Parent'
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} display={'flex'} alignItems={'center'}>
        <Typography variant='h6' width={100}>
          Send to
        </Typography>
        <Autocomplete
          key={key}
          options={data}
          defaultValue={defaulValue.concat(parentList)}
          multiple
          fullWidth
          loading={loadParentsLoading}
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
          onChange={(e: any, value: any, r: any, d: any) => {
            switch (r) {
              case 'clear':
                setDefaultValue([])
                setParents([])
                setIsDelete(true)
                break
              case 'removeOption':
                const defaultValueCopy = JSON.parse(JSON.stringify(defaulValue))
                const dIndex = defaultValueCopy.findIndex((c: any) => c._id === d.option._id)
                if (dIndex !== -1) {
                  defaultValueCopy.splice(dIndex, 1)
                  setDefaultValue(defaultValueCopy)
                }
                const parentListCopy = JSON.parse(JSON.stringify(parentList))
                const pIndex = parentListCopy.findIndex((c: any) => c._id === d.option._id)
                if (pIndex !== -1) {
                  parentListCopy.splice(pIndex, 1)
                  setParentList(parentListCopy)
                }
                setIsDelete(true)
                break
            }
            // if (value) {
            //   const items: any = []
            //   value.map((item: any) => {
            //     items.push({
            //       userId: item.id,
            //       to: item.email
            //     })
            //   })
            //   setDataItem(items)
            // }
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
      <Grid item xs={12} textAlign={'center'} mt={10}>
        <LoadingButton
          variant='contained'
          loading={sendLoading}
          endIcon={<i className='ri-send-plane-line' />}
          onClick={sendMailValid}
        >
          Send
        </LoadingButton>
      </Grid>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 35, horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 200 }}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
      >
        <Grid container spacing={2} width={540}>
          <Grid item xs={12} textAlign={'center'}>
            <Typography fontWeight={600}>Please check all the recipients information before sending?</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} textAlign={'center'}>
            <Button onClick={handleRowOptionsClose}>Cancel</Button>{' '}
            <LoadingButton loading={sendLoading} onClick={send}>
              Confirm
            </LoadingButton>
          </Grid>
        </Grid>
      </Menu>
    </Grid>
  )
}
