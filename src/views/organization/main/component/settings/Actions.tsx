// MUI Imports
import Card from '@mui/material/Card'

// Style Imports
import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import { useOrganization } from '@/hooks/useOrganization'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { Organization } from '@/types/organization'
import { success } from '@/utils/toasts'
import saveOrganization from '@/api/organization/saveOrganization'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { any, object, unknown } from 'valibot'
import classnames from 'classnames'
import DeleteButton from '@/views/course/component/DeleteButton'
import { Enrollment } from '@/types/organization/enrollment'
import { getEnrollments } from '@/api/organization/enrollment/getEnrollmens'
import { showChipLabel } from '@/utils/organization'
import { guid } from '@/utils/data'

const Actions = () => {
  //States
  const [submitLoading, setSubmitLoading] = useState(false)
  const [planData, setPlanData] = useState<Enrollment[]>()
  const [planLoading, setPlanLoading] = useState(true)

  //Hooks
  const { organization, setOrganization } = useOrganization()

  const user = useUser()

  const [viewCourse, setViewCourse] = useState<number | undefined>(organization?.viewCourseRole)
  const [joinType, setJoinType] = useState<number | undefined>(organization?.joinType)

  const loadPlans = async () => {
    const { data } = await getEnrollments(user as UserTable, organization?._id as string)
    if (data) {
      setPlanData(data.filter(c => showChipLabel(c, user)?.title?.toLowerCase() === 'active'))
      setPlanLoading(false)
    }
  }

  useEffect(() => {
    if (organization) {
      setValue('isDonateButton', organization.isDonateButton)
      setValue('isViewCourseButton', organization.isViewCourseButton)
      setValue('isJoinEnrollmentPlanButton', organization.isJoinEnrollmentPlanButton)
      setValue('isCustomizeDonate', organization.isCustomizeDonate)
      setValue('donationTiers', organization.donationTiers)
      setValue('noEnrollmentPlan', organization.noEnrollmentPlan)
      setValue('joinEnrollmentPlan', organization.joinEnrollmentPlan)
      loadPlans()
    }
  }, [organization])

  const { control, setValue, watch, getValues } = useForm<Organization>({
    defaultValues: {},
    resolver: valibotResolver(object({ isDonateButton: any(), isCustomizeDonate: any(), donationTiers: any() }))
  })

  const { append, replace } = useFieldArray({
    control,
    name: 'donationTiers'
  })

  const items = useWatch({
    control,
    name: `donationTiers`,
    defaultValue: organization?.donationTiers
  })

  const isDonateButton = watch('isDonateButton', organization?.isDonateButton)
  const isViewCourseButton = watch('isViewCourseButton', organization?.isViewCourseButton)
  const isJoinEnrollmentPlanButton = watch('isJoinEnrollmentPlanButton', organization?.isJoinEnrollmentPlanButton)
  const noEnrollmentPlan = watch('noEnrollmentPlan', organization?.noEnrollmentPlan)

  const handleSubmit = async () => {
    setSubmitLoading(true)
    const updateOrg = { ...organization }
    updateOrg.viewCourseRole = viewCourse
    updateOrg.isDonateButton = getValues().isDonateButton
    updateOrg.isCustomizeDonate = getValues().isCustomizeDonate
    updateOrg.isViewCourseButton = getValues().isViewCourseButton
    updateOrg.donationTiers = getValues().isDonateButton ? items : []
    updateOrg.isJoinEnrollmentPlanButton = getValues().isJoinEnrollmentPlanButton
    updateOrg.joinEnrollmentPlan = getValues().joinEnrollmentPlan
    updateOrg.noEnrollmentPlan = getValues().noEnrollmentPlan
    updateOrg.joinType = joinType

    await saveOrganization(user as UserTable, updateOrg as unknown as Organization)
    setSubmitLoading(false)
    setOrganization(updateOrg as unknown as Organization)
    success('Save successful!')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <div className='flex justify-between'>
                <Typography variant='h5'>Join In Button</Typography>
                <Controller
                  name='isJoinEnrollmentPlanButton'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      onChange={(e, c) => setValue('isJoinEnrollmentPlanButton', c)}
                      checked={field.value === undefined ? undefined : field.value}
                    />
                  )}
                />
              </div>
            }
            subheader={isJoinEnrollmentPlanButton ? 'This will allow other users to join the organization.' : ''}
          />
          <CardContent>
            {isJoinEnrollmentPlanButton && (
              <div className='flex flex-col gap-4'>
                <Controller
                  name='joinEnrollmentPlan'
                  control={control}
                  render={({ field }) => (
                    <div className='flex  gap-4'>
                      {!planLoading && (
                        <FormControl variant='standard' fullWidth disabled={noEnrollmentPlan}>
                          <InputLabel>Choose an enrollment plan</InputLabel>
                          <Select {...field}>
                            {planData?.map(plan => (
                              <MenuItem key={plan._id} value={plan._id} selected>
                                {plan.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      <div className='flex self-end w-[150px]'>
                        <Controller
                          name='noEnrollmentPlan'
                          control={control}
                          render={({ field: prop }) => (
                            <FormControlLabel
                              label='No plan'
                              control={
                                <Switch
                                  {...prop}
                                  onChange={(e, c) => {
                                    setValue('noEnrollmentPlan', c)
                                    setValue('joinEnrollmentPlan', '')
                                  }}
                                  checked={prop.value === undefined ? undefined : prop.value}
                                />
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                />
                {noEnrollmentPlan && (
                  <RadioGroup
                    value={joinType}
                    onChange={e => setJoinType(parseInt(e.target.value))}
                    aria-labelledby='method-radio-buttons-group'
                    className='items-start mbe-4'
                  >
                    <FormControlLabel value='0' control={<Radio />} label='Open to All' />
                    <FormControlLabel value='1' control={<Radio />} label='Join Upon Approval' />
                  </RadioGroup>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <div className='flex justify-between'>
                <Typography variant='h5'>View all course button</Typography>
                <Controller
                  name='isViewCourseButton'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      onChange={(e, c) => setValue('isViewCourseButton', c)}
                      checked={field.value === undefined ? undefined : field.value}
                    />
                  )}
                />
              </div>
            }
            subheader={isViewCourseButton ? 'Select the accessibility for your courses.' : ''}
          />
          <CardContent>
            {isViewCourseButton && (
              <RadioGroup
                value={viewCourse}
                onChange={e => setViewCourse(parseInt(e.target.value))}
                aria-labelledby='method-radio-buttons-group'
                className='items-start mbe-4'
              >
                <FormControlLabel value='1' control={<Radio />} label='Everyone' />
                <FormControlLabel value='2' control={<Radio />} label='Users within the institution only' />
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <div className='flex justify-between'>
                <Typography variant='h5'>Donate button</Typography>
                <Controller
                  name='isDonateButton'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      onChange={(e, c) => setValue('isDonateButton', c)}
                      checked={field.value === undefined ? undefined : field.value}
                    />
                  )}
                />
              </div>
            }
            subheader={
              isDonateButton
                ? 'You can customize the donation amount tiers for students to choose from. You can also add descriptions for these tiers.'
                : ''
            }
          />
          <CardContent>
            <div className='flex flex-col gap-4 pt-2'>
              {isDonateButton && (
                <>
                  {items?.map((item, index) => {
                    return (
                      <>
                        <div key={item._id} className={classnames('repeater-item flex relative border rounded', {})}>
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
                                  <TextField
                                    className='w-1/6'
                                    label='Donation Amount'
                                    type='number'
                                    {...field}
                                    value={field.value !== undefined ? field.value : unknown}
                                  />
                                )}
                              />
                              <Controller
                                key={`donationTiers.${index}.description` as any}
                                name={`donationTiers.${index}.description` as any}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    className='w-full'
                                    label='Description'
                                    {...field}
                                    value={field.value !== undefined ? field.value : unknown}
                                  />
                                )}
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
                    name='isCustomizeDonate'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        label='Allow Customized Amount'
                        control={<Checkbox {...field} defaultChecked={organization?.isCustomizeDonate} />}
                      />
                    )}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <div className='flex justify-center gap-4'>
          <LoadingButton variant='contained' loading={submitLoading} onClick={handleSubmit}>
            Save Changes
          </LoadingButton>
        </div>
      </Grid>
    </Grid>
  )
}

export default Actions
