'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useInOrganization, useOrganization } from '@/hooks/useOrganization'
import { FILE_PATH } from '@/types'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import { useEffect, useState } from 'react'
import { Enrollment, PaymentType } from '@/types/organization/enrollment'
import { getEnrollmentDetail } from '@/api/organization/enrollment/getEnrollmentDetail'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { Avatar, Box, Checkbox, FormControlLabel, Grid } from '@mui/material'
import Title from '@/components/title'
import { LoadingButton } from '@mui/lab'
import format from '@/utils/format'
import { transformDateFromUTC } from '@/utils/date'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import { pushOrganizationUser } from '@/api/organization/user/addOrganizationUser'
import { UserTable } from '@/types/user/UserTable'
import TargetDialog from '@/components/dialog'
import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import FileList from '@/components/file-upload/FileList'
import FileUpload from '@/components/file-upload'
import { FileType } from '@/types/file/file'
import { saveSigned } from '@/api/organization/enrollment-policy/saveSigned'
import { uploadMultiple } from '@/api/upload'
import { getImg } from '@/utils/getImg'

const Share = ({ shareId }: { shareId: string }) => {
  //Hooks
  const [data, setData] = useState<Enrollment>()
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [policy, setPolicy] = useState<EnrollmentPolicy>()
  const [policyChecked, setPolicyChecked] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [signedFiles, setSignedFiles] = useState<FileType[]>()

  //Hooks
  const user = useUser()
  const inOrg = useInOrganization()
  const { organization } = useOrganization()
  const { organizationId, lang } = useParams()
  const { push } = useRouter()
  const { setTitle, setBackUrl } = useGlobal()

  useEffect(() => {
    setBackUrl(null)
    setTitle('')
  }, [])

  useEffect(() => {
    const loadEnrollment = async () => {
      if (shareId && user) {
        const { data } = await getEnrollmentDetail(user, shareId)
        setData(data)
        setPolicy(data?.policys && data.policys.length ? (data.policys[0] as EnrollmentPolicy) : undefined)
        setLoading(false)
        // if (data.instructorId) {
        //   const { data: org } = await getOrganization(user, data.instructorId)
        //   setOrganization(org)
        // }
      }
    }

    loadEnrollment()
  }, [shareId, user])

  const nextStep = async (checkPolicy?: boolean) => {
    if (inOrg) {
      push(getLocalizedUrl('/organization/home', lang as Locale))

      return
    }
    if (checkPolicy && data?.policys && data.policys.length > 0) {
      setPolicyOpen(true)

      return
    }
    if (data?.surveys && data.surveys.length > 0) {
      push(
        getLocalizedUrl(
          `/organization/${organizationId}/share/${data._id}/answer/${(data.surveys[0] as EnrollmentSurvey)._id}`,
          lang as Locale
        )
      )
    } else if (data?.paymentType === PaymentType.Flexible || data?.paymentType === PaymentType.Fixed) {
      push(getLocalizedUrl(`/organization/${organizationId}/share/${data._id}/payment`, lang as Locale))
    } else {
      await pushOrganizationUser(user as UserTable, organizationId as string, data?._id as string)
      push(getLocalizedUrl('/organization/home', lang as Locale))
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    setUploadLoading(true)
    const { data } = await uploadMultiple(user as UserTable, files)
    setSignedFiles(data)
    setUploadLoading(false)
  }

  const saveSignedFile = async () => {
    try {
      if (signedFiles && signedFiles.length > 0) {
        const params = signedFiles.map(file => ({
          temporary: file.temporary,
          final: file.final,
          instructorId: organizationId as string,
          policyId: policy?._id as string,
          enrollmentPlanId: data?._id as string
        }))
        await saveSigned(user as UserTable, params)
      }
      await nextStep()
    } catch {}
  }

  return (
    <Card>
      {!loading && data?.banners && data.banners.length > 0 ? (
        <Swiper
          id='customer_swiper'
          navigation={true}
          pagination={false}
          slidesPerView={1}
          spaceBetween={16}
          autoplay={{ delay: 5000 }}
          loop={true}
          className='bs-[250px]'
        >
          {data?.banners?.map(img => (
            <SwiperSlide key={img._id} style={{ display: 'flex' }}>
              <CardMedia image={FILE_PATH + img.temporary} className=' w-full h-full' />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <CardMedia image={`/images/pages/profile-banner.png`} className='bs-[250px]' />
      )}

      <CardContent className=''>
        <Grid container>
          <Grid item xs={8} mt={4}>
            <Title variant='h5'>{data?.title}</Title>
          </Grid>
          <Grid item xs={4} mt={4} textAlign={'right'} sx={{ position: 'sticky', top: '30px' }}>
            <LoadingButton variant='contained' onClick={async () => await nextStep(true)} disabled={loading}>
              {loading ? '...' : inOrg ? 'Enter' : 'Apply to join'}
            </LoadingButton>
          </Grid>
          <Grid item xs={12} mt={10}>
            <Box
              bgcolor={'#f1f2f4'}
              sx={{ width: '60%', paddingTop: 5, display: 'flex', gap: 8, flexDirection: 'row' }}
            >
              <Avatar
                alt=''
                src={getImg(organization?.orgImg?.temporary)}
                variant='rounded'
                sx={{ width: 120, height: 120, marginBottom: 4, ml: 4 }}
              />
              <Box display={'flex'} gap={1} flexDirection='column' justifyContent={'center'}>
                <Typography variant='h6' noWrap>
                  <Title sx={{ fontSize: 16 }}>by</Title> {organization?.name}
                </Typography>

                <Typography noWrap>Created on:{format(organization?.createdAt)}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} mt={10}>
            <Grid container>
              <Grid item xs={12}>
                <Title variant='h5'>Registration Window</Title>
              </Grid>
              <Grid item xs={12} mt={4} display={'flex'} gap={2}>
                <i className='ri-calendar-line'></i>
                <Typography>
                  {format(transformDateFromUTC(data?.startTime as string, user))} -
                  {format(transformDateFromUTC(data?.endTime as string, user))}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} mt={10}>
            <Grid container>
              <Grid item xs={12}>
                <Title variant='h5'>Location</Title>
              </Grid>
              <Grid item xs={12} mt={4}>
                <div className='flex gap-2'>
                  <i className='ri-map-pin-line'></i>
                  <Typography>{data?.location}</Typography>
                </div>
                <Box pl={6} pt={2}>
                  <Button
                    endIcon={showMap ? <i className='ri-arrow-up-line'></i> : <i className='ri-arrow-down-line'></i>}
                    onClick={() => {
                      setShowMap(!showMap)
                    }}
                  >
                    {showMap ? 'hidden' : 'Show'} Map
                  </Button>
                  {showMap && (
                    <Box pt={2}>
                      <iframe
                        width='100%'
                        height='100%'
                        frameBorder='0'
                        title='map'
                        marginHeight={0}
                        marginWidth={0}
                        scrolling='no'
                        src={`https://maps.google.com/maps?width=100%&height=100%&hl=en&q=${data?.location}&ie=UTF8&t=&z=14&iwloc=B&output=embed`}
                        style={{
                          minHeight: 300,
                          filter: 'none'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} mt={10}>
            <Grid container>
              <Grid item xs={12}>
                <Title variant='h5'>Refund Policy</Title>
              </Grid>
              <Grid item xs={12} mt={4}>
                <Typography>{data?.refund}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} mt={20}>
            <Grid container>
              <Grid item xs={12}>
                <Title variant='h5'>Description</Title>
              </Grid>
              <Grid item xs={12} mt={4}>
                <Typography
                  sx={{ wordWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: data?.description || '' }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <TargetDialog
        title={policy?.title || ''}
        open={policyOpen}
        setOpen={setPolicyOpen}
        content={
          <div className='flex flex-col gap-4'>
            <Typography
              variant='subtitle2'
              sx={{ wordWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: policy?.description || '' }}
            />
            <Typography variant='h5'>Attachment</Typography>
            <FileList files={policy?.policyFile} />
            <FormControlLabel
              control={
                <Checkbox
                  key={'usePolicy'}
                  value={policyChecked}
                  onChange={(e, c) => {
                    setPolicyChecked(c)
                  }}
                />
              }
              label='I agree to the terms and conditions.'
            />
            <div className='flex items-center'>
              <div className='w-1/5'>
                <FileUpload
                  multiple={false}
                  loading={uploadLoading}
                  accept='application/pdf,image/png,image/jpeg'
                  handleUploadFiles={handleUploadFiles}
                />
              </div>
              <div className='w-3/4'>
                <Typography>Please upload the signed document to proceed</Typography>
              </div>
            </div>
            <FileList files={signedFiles} setFiles={setSignedFiles} />
          </div>
        }
        actions={
          <div>
            <Button
              variant='outlined'
              onClick={() => {
                setPolicyOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={saveSignedFile}
              disabled={!policyChecked || (policy?.usePolicy && !signedFiles?.length)}
            >
              Confirm
            </Button>
          </div>
        }
      />
    </Card>
  )
}

export default Share
