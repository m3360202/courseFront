'use client'

import { SyntheticEvent, useEffect, useState } from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { any, date, nonEmpty, number, object, optional, pipe, string } from 'valibot'

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  Typography
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import Title from '@/components/title'
import { useDictionary } from '@/hooks/useDictionary'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import type { Locale } from '@/configs/i18n'
import AddressInput from '@/components/address-input'

import type { UserTable } from '@/types/user/UserTable'
import { transformDateFromUTC } from '@/utils/date'
import { RequiredStar } from '@/components/form-field'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { error, success } from '@/utils/toasts'
import { delay } from 'lodash'
import { getLocalizedUrl } from '@/utils/i18n'
import { getEnrollmentDetail } from '@/api/organization/enrollment/getEnrollmentDetail'
import FileUpload from '@/components/file-upload'
import { FileType } from '@/types/file/file'
import { uploadMultiple } from '@/api/upload'
import FileList from '@/components/file-upload/FileList'
import useDescription from '@/hooks/useDescription'
import { EditorState } from 'draft-js'
import TargetDialog from '@/components/dialog'
import Crop from '@/components/crop'
import { Enrollment } from '@/types/organization/enrollment'
import saveEnrollment from '@/api/organization/enrollment/saveEnrollment'
import CustomizedTooltip from '@/components/tool-tip'
import DeleteButton from '../../component/DeleteButton'
import classnames from 'classnames'
import FormLayout from '@/components/layout/FormLayout'
import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import { getEnrollmentPolicys } from '@/api/organization/enrollment-policy/getEnrollmentPolicys'
import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import { getEnrollmentSurveys } from '@/api/organization/enrollment-survey/getEnrollmentSurveys'
import { informationData } from '@/types'
import { guid } from '@/utils/data'
import Editor from '@/components/editor'

const SaveEnrollment = ({ courseId, organizationId }: { courseId?: string; organizationId: string }) => {
  //States
  const [saveLoading, setSaveLoading] = useState(false)
  const [collects, setCollects] = useState<{ [key: string]: boolean }>({})
  const [value, setContentValue] = useState<EditorState | undefined>()
  const [files, setFiles] = useState<FileType[]>()
  const [uploadLoading, setUploadLoading] = useState(false)
  const [cropOpen, setCropOpen] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  const [policys, setPolicys] = useState<EnrollmentPolicy[]>()
  const [surveys, setSurveys] = useState<EnrollmentSurvey[]>()

  // Hooks
  const dictionary = useDictionary()
  const user = useUser()
  const { lang: locale } = useParams()
  const { push } = useRouter()
  const { addTopButtons, setBackUrl, setHiddenTabs } = useGlobal()
  const [loading, setLoading] = useState(false)

  //Vars

  const loadEnrollment = async () => {
    setLoading(true)
    const { data } = await getEnrollmentDetail(user as UserTable, courseId as string)
    if (data) {
      const keys = Object.keys(data) as Array<keyof Enrollment>
      keys.map(key => {
        switch (key) {
          case 'startTime':
          case 'endTime':
            setValue(key, transformDateFromUTC(data[key] as Date, user))
            break
          case 'banners':
            setValue(key, data[key])
            setFiles(data[key])
            break
          case 'collects':
            const cols: { [key: string]: boolean } = {}
            setValue(key, data[key])
            data[key]?.map(item => {
              cols[item] = true
            })
            setCollects(cols)
            break
          case 'surveys':
          case 'policys':
            setValue(key, data[key] ? (data[key]?.map((c: any) => c._id).join() as any) : undefined)
            break
          default:
            setValue(key, data[key])
            break
        }
      })
    }
    setLoading(false)
  }

  const loadEnrollmentPolicys = async () => {
    const { data } = await getEnrollmentPolicys(user as UserTable, organizationId as string, true)
    setPolicys(data)
  }

  const loadEnrollmentSurveys = async () => {
    const { data } = await getEnrollmentSurveys(user as UserTable, organizationId as string, true)
    setSurveys(data)
  }

  useEffect(() => {
    if (user) {
      courseId && loadEnrollment()
      if (organizationId) {
        loadEnrollmentPolicys()
        loadEnrollmentSurveys()
      }
    }
  }, [user, courseId, organizationId])

  useEffect(() => {
    setValue('collects', getCheckedValues())
  }, [collects])

  useEffect(() => {
    setValue('banners', files)
  }, [files])

  useEffect(() => {
    user && addTopButtons([
      <LoadingButton key='valid' variant='contained' onClick={handleSubmit(onSubmit)} loading={saveLoading}>
        {dictionary.common.submit}
      </LoadingButton>
    ])

    setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/enrollment`, locale as Locale)])
    setHiddenTabs(true)

    return () => {
      addTopButtons(null)
      setBackUrl(null)
      setHiddenTabs(false)
    }
  }, [user])

  const schema = object({
    _id: any(),
    title: pipe(string(dictionary.common.fieldRequired), nonEmpty(dictionary.common.fieldRequired)),
    startTime: date(dictionary.common.fieldRequired),
    endTime: date(dictionary.common.fieldRequired),
    policys: any(),
    surveys: any(),
    paymentType: number(),
    location: optional(string()),
    refund: optional(string()),
    donateLater: any(),
    customizeDonate: any(),
    paymentDescription: any(),
    amount: any(),
    donationTiers: any(),
    collects: any(),
    banners: any()
  })

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Enrollment>({
    defaultValues: {},
    resolver: valibotResolver(schema)
  })

  const paymentType = watch('paymentType')

  const { append, replace } = useFieldArray({
    control,
    name: 'donationTiers'
  })

  const items = useWatch({
    control,
    name: `donationTiers`
  })

  const handleChange = (name: string) => (event: SyntheticEvent<Element, Event>, checked: boolean) => {
    setCollects(prevState => ({
      ...prevState,
      [name]: checked
    }))
  }

  const getCheckedValues = () => {
    return Object.entries(collects)
      .filter(([, value]) => value)
      .map(([key]) => key)
  }

  useDescription(value, setValue)

  const onSubmit = async (data: Enrollment) => {
    try {
      setSaveLoading(true)
      data.courseId = courseId
      data.instructorId = organizationId
      await saveEnrollment(user as UserTable, data)
      success(`${dictionary.common.edit} ${dictionary.common.successful}`)
      delay(() => push(getLocalizedUrl(`/course/${courseId}/detail/enrollment`, locale as Locale)), 500)
    } catch (e) {
      console.log(e)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleUploadFiles = async (fileList: File[]) => {
    setFile(fileList[0])
    setCropOpen(true)
  }

  const onUploadHandle = async (file: File) => {
    try {
      setUploadLoading(true)
      const { data } = await uploadMultiple(user as UserTable, [file])
      const fs = [...data, ...(files ?? [])]
      setFiles(fs)
      setCropOpen(false)
    } catch (err: any) {
      error(err.response.data)
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <FormLayout>
      <div className='p-5'>
        <div className='flex flex-col gap-5'>
          <Card>
            <CardContent>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={field.onChange}
                    fullWidth
                    label='Title'
                    placeholder=''
                    {...(errors.title && {
                      error: true,
                      helperText: errors?.title?.message
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                    }}
                  />
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className='flex gap-1 w-full'>
                <div className=' w-1/2'>
                  <Controller
                    name='startTime'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <AppReactDatepicker
                        selected={field.value as Date}
                        onChange={date => {
                          setValue('startTime', date as Date)
                        }}
                        placeholderText='MM/DD/YYYY'
                        customInput={
                          <TextField
                            fullWidth
                            label='StartDate'
                            InputProps={{
                              startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                            }}
                            {...(errors.startTime && {
                              error: true,
                              helperText: errors?.startTime?.message
                            })}
                          />
                        }
                      />
                    )}
                  />
                </div>
                <div className=' w-1/2'>
                  <Controller
                    name='endTime'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <AppReactDatepicker
                        selected={field.value as Date}
                        onChange={date => {
                          setValue('endTime', date as Date)
                        }}
                        placeholderText='MM/DD/YYYY'
                        customInput={
                          <TextField
                            fullWidth
                            label='EndtDate'
                            {...(errors.endTime && {
                              error: true,
                              helperText: errors?.endTime?.message
                            })}
                            InputProps={{
                              startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                            }}
                          />
                        }
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className='flex flex-col gap-4'>
                <Title variant='h5'>Information collection</Title>
                {!loading &&
                  informationData.map(item => (
                    <>
                      <Divider textAlign='left' sx={{ '&::before': { width: 0 } }}>
                        {item.title}
                      </Divider>
                      <FormGroup>
                        {item.items.map(info => (
                          <FormControlLabel
                            key={info.title}
                            value={info.value}
                            checked={Object.keys(collects).length === 0 ? undefined : collects[info.value]}
                            control={<Checkbox />}
                            label={info.title}
                            onChange={handleChange(info.value)}
                          />
                        ))}
                      </FormGroup>
                    </>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel error={Boolean(errors.surveys)}>Select policy</InputLabel>
                <Controller
                  name='policys'
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={'Select policy'}
                      {...field}
                      value={field.value !== undefined ? field.value : ''}
                      error={Boolean(errors.policys)}
                      onChange={event => {
                        field.onChange(event, event.target.value === '' ? null : [event.target.value])
                      }}
                    >
                      {policys?.map(policy => (
                        <MenuItem key={policy._id} value={policy._id}>
                          {policy.title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel error={Boolean(errors.surveys)}>Select questionnaire</InputLabel>
                <Controller
                  name='surveys'
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={'Select questionnaire'}
                      {...field}
                      value={field.value !== undefined ? field.value : ''}
                      error={Boolean(errors.surveys)}
                      onChange={event => {
                        field.onChange(event, event.target.value === '' ? null : [event.target.value])
                      }}
                    >
                      {surveys?.map(survey => (
                        <MenuItem key={survey._id} value={survey._id}>
                          {survey.title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel error={Boolean(errors.paymentType)}>Payment Method</InputLabel>
                <Controller
                  name='paymentType'
                  control={control}
                  render={({ field }) => (
                    <div className='flex gap-2'>
                      <Select
                        label={'Payment Method'}
                        {...field}
                        sx={{ width: field.value == 3 ? '80%' : '100%' }}
                        value={field.value !== undefined ? field.value : ''}
                        error={Boolean(errors.paymentType)}
                        onChange={event => {
                          field.onChange(event, event.target.value === '' ? null : Number(event.target.value))
                        }}
                      >
                        <MenuItem value={1}>Free: No fee to join the institution</MenuItem>
                        <MenuItem value={2}>Flexible: Applicants can make their own choices</MenuItem>
                        <MenuItem value={3}>Fixed Fee</MenuItem>
                      </Select>
                      {paymentType == 3 && (
                        <Controller
                          name='amount'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              sx={{ width: '20%' }}
                              type='number'
                              InputProps={{
                                endAdornment: <InputAdornment position='start'>US$</InputAdornment>
                              }}
                              inputProps={{ min: 0 }}
                              {...field}
                            />
                          )}
                        />
                      )}
                    </div>
                  )}
                />
                {errors.paymentType && <FormHelperText error>{dictionary.common.fieldRequired}</FormHelperText>}
              </FormControl>

              {paymentType == '2' && (
                <div className='flex flex-col gap-4 pt-2'>
                  <Controller
                    name='donateLater'
                    control={control}
                    render={({ field }) => (
                      <div className='flex  items-baseline'>
                        <FormControlLabel
                          label='Allow students to donate later'
                          control={<Checkbox {...field} defaultChecked={field.value} />}
                        />
                        <CustomizedTooltip
                          title={`Allow students to skip the donation process and consider making a donation after joining the institution.
`}
                        >
                          <i className='ri-error-warning-fill'></i>
                        </CustomizedTooltip>
                      </div>
                    )}
                  />
                  <div className='flex gap-2  items-center'>
                    <Title variant='h5'>Donation tiers</Title>
                    <CustomizedTooltip
                      title={`You can customize the donation amount tiers for students to choose from. You can also add descriptions for these tiers.
`}
                    >
                      <i className='ri-error-warning-fill'></i>
                    </CustomizedTooltip>
                  </div>
                  {items?.map((item, index) => {
                    return (
                      <>
                        <div key={index} className={classnames('repeater-item flex relative border rounded', {})}>
                          <Grid container spacing={5} className='m-0 pbe-5'>
                            <Grid item xs={12} mr={4} className='flex gap-4 items-center'>
                              <Typography variant='h5' className='pr-4'>
                                {index + 1}
                              </Typography>
                              <Controller
                                key={`donationTiers.${index}.amount` as any}
                                name={`donationTiers.${index}.amount` as any}
                                control={control}
                                render={({ field }) => (
                                  <TextField className='w-1/6' label='Donation Amount' type='number' {...field} />
                                )}
                              />
                              <Controller
                                key={`donationTiers.${index}.description` as any}
                                name={`donationTiers.${index}.description` as any}
                                control={control}
                                render={({ field }) => <TextField className='w-full' label='Description' {...field} />}
                              />
                            </Grid>
                          </Grid>
                          <div className='flex flex-col justify-start border-is'>
                            <DeleteButton id={item._id as string} items={items} replace={replace} />
                          </div>
                        </div>
                      </>
                    )
                  })}
                  <Button
                    variant='contained'
                    className=' w-1/6'
                    startIcon={<i className='ri-add-line' />}
                    onClick={() => {
                      append({ _id: guid() })
                    }}
                  >
                    Add Tier
                  </Button>
                  <Controller
                    name='customizeDonate'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        label='Students are still allowed to customize the amout of their donation'
                        control={<Checkbox {...field} defaultChecked={field.value} />}
                      />
                    )}
                  />
                  <Controller
                    name={'paymentDescription'}
                    control={control}
                    render={({ field }) => <TextField className='w-full' label='Payment Description' {...field} />}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Controller
                name='location'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <AddressInput
                    value={field.value as string}
                    onChange={newValue => field.onChange(newValue)}
                    label='Location'
                  />
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Controller
                name='refund'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    minRows={3}
                    maxRows={5}
                    onChange={field.onChange}
                    fullWidth
                    label='Refund Policy'
                    placeholder=''
                  />
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Controller
                name='description'
                control={control}
                rules={{ required: true }}
                render={() => (
                  <>
                    <Editor
                      placeholder='Description'
                      user={user as UserTable}
                      value={value}
                      setContentValue={setContentValue}
                    />
                    {errors.description && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>
                    )}
                  </>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Title variant='h5' className='pb-2'>
                Banner
              </Title>
              <FileUpload loading={uploadLoading} handleUploadFiles={handleUploadFiles} />
              <FileList files={files} setFiles={setFiles} />
            </CardContent>
          </Card>
        </div>
      </div>
      <TargetDialog
        title='Crop Image'
        open={cropOpen}
        setOpen={setCropOpen}
        content={<Crop file={file} aspectRatio={1200 / 460} onUploadHandle={onUploadHandle} loading={uploadLoading} />}
      />
    </FormLayout>
  )
}

export default SaveEnrollment
