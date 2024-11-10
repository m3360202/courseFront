'use client'

// MUI Imports
import Typography from '@mui/material/Typography'

// Components Imports
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter } from 'next/navigation'
import PermissionButton from '@/components/buttons/PermissionButton'
import { useDictionary } from '@/hooks/useDictionary'
import Link from 'next/link'
import { UserTable } from '@/types/user/UserTable'
import LoadingButton from '@mui/lab/LoadingButton'
import { error, success } from '@/utils/toasts'
import ConfirmDialog from '@/components/confirm'
import { Box, Button } from '@mui/material'
import delay from '@/utils/delay'
import { deleteEnrollmentPolicy } from '@/api/organization/enrollment-policy/deleteEnrollmentPolicy'
import ShareContent from '@/views/course/component/ShareContent'
import { DetailItem } from '@/types'
import { Enrollment } from '@/types/organization/enrollment'
import { getEnrollmentDetail } from '@/api/organization/enrollment/getEnrollmentDetail'
import format from '@/utils/format'
import { transformDateFromUTC } from '@/utils/date'
import { showChipLabel } from '@/utils/organization'
import { activeEnrollment, invalidEnrollment } from '@/api/organization/enrollment/activeEnrollment'

const PlanView = ({ planId }: { planId: string }) => {
  //States
  const [data, setData] = useState<Enrollment>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [, setLoading] = useState(true)
  const [isHover, setIsHover] = useState(false)
  const [activeLoading, setActiveLoading] = useState(false)
  const [invalidLoading, setInvalidLoading] = useState(false)

  // Hooks
  const { lang: locale, organizationId } = useParams()
  const { setBackUrl,setTitle } = useGlobal()
  const user = useUser()
  const dictionary = useDictionary()
  const { push } = useRouter()

  useEffect(() => {
    const loadPlan = async () => {
      if (user && planId) {
        const { data } = await getEnrollmentDetail(user, planId)
        setData(data)
        setLoading(false)
      }
    }
    loadPlan()
  }, [user, planId, activeLoading, invalidLoading])

  useEffect(() => {
    organizationId &&
      setBackUrl([getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-plan`, locale as Locale)])
    setTitle('Enrollment plan view')

    return () => {
      setBackUrl(null)
    }
  }, [user, organizationId])

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteEnrollmentPolicy(user as UserTable, planId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
      delay(
        () => push(getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-plan`, locale as Locale)),
        500
      )
    } catch (err) {
      error((error as unknown as { message: string })?.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const status = showChipLabel(data, user)

  const handleActive = async () => {
    setActiveLoading(true)
    await activeEnrollment(user as UserTable, planId as string)
    success('Actived!')
    setActiveLoading(false)
  }

  const handleInvalid = async () => {
    setInvalidLoading(true)
    await invalidEnrollment(user as UserTable, planId as string)
    success('Deactivated!')
    setInvalidLoading(false)
  }

  const buttons = [
    <PermissionButton key={'active'} isShow={data?.invalid}>
      <LoadingButton loading={activeLoading} onClick={handleActive}>
        Active
      </LoadingButton>
    </PermissionButton>,
    <PermissionButton key={'edit'} isShow={true}>
      <Button
        size='small'
        component={Link}
        href={getLocalizedUrl(
          `/organization/${organizationId}/detail/enrollment-plan/${planId}/edit`,
          locale as Locale
        )}
      >
        Edit
      </Button>
    </PermissionButton>,
    <PermissionButton key={'delete'} isShow={true}>
      <ConfirmDialog
        title={dictionary.common.delete}
        confirm={async () => {
          await handleDelete()
        }}
      >
        <LoadingButton loading={deleteLoading}>Delete</LoadingButton>
      </ConfirmDialog>
    </PermissionButton>,
    <PermissionButton key={'deactivate'} isShow={true}>
      {isHover && (
        <LoadingButton
          color='error'
          loading={invalidLoading}
          onMouseOut={() => {
            setIsHover(false)
          }}
          onClick={handleInvalid}
        >
          Deactivate
        </LoadingButton>
      )}
      {!isHover && (
        <Typography
          sx={{ cursor: status.canHover ? 'pointer' : 'default' }}
          color='secondary'
          onMouseMove={() => {
            if (status.canHover) setIsHover(true)
            else setIsHover(false)
          }}
        >
          {status.title}
        </Typography>
      )}
    </PermissionButton>
  ]

  const items: DetailItem[] = [
    // {
    //   title: 'Title',
    //   value: course?.title,
    //   col: 1
    // },
    {
      title: 'Valid time',
      value: data?.startTime
        ? format(transformDateFromUTC(data?.startTime as string, user), 'YYYY/MM/DD', false) +
          '-' +
          format(transformDateFromUTC(data?.endTime as string, user), 'YYYY/MM/DD', false)
        : '',
      col: 1,
      icon: 'ri-calendar-schedule-line'
    },
    {
      title: 'Information collection',
      value: data?.collects?.map((item: any) => item).join(' , '),
      col: 1,
      icon: 'ri-time-zone-line'
    },
    {
      title: 'Select policy',
      col: 1,
      value: data?.policys?.map((item: any) => item.title).join(','),
      icon: 'ri-timeline-view'
    },
    {
      title: 'Select questionnaire',
      value: data?.surveys?.map((item: any) => item.title).join(','),
      col: 2,
      icon: 'ri-book-read-line'
    },
    {
      title: 'Payment method',
      col: 2,
      value: (
        <>
          {data?.paymentType === 1 && <Typography>Free: No fees to join the institution</Typography>}
          {data?.paymentType === 2 && (
            <Typography>Donation: It will be up to the student to decide how much to pay</Typography>
          )}
          {data?.paymentType === 3 && (
            <Box display={'flex'} gap={4}>
              <Typography>Fixed fee</Typography>
              <Typography>${data.amount}</Typography>
            </Box>
          )}
        </>
      ),
      icon: 'ri-money-euro-box-line'
    },
    {
      title: 'Enrollment plan url',
      value: !data ? (
        ''
      ) : status.title === 'Expired' ? (
        status.title
      ) : (
        <Typography
          noWrap
          sx={{ width: '70%' }}
        >{`${process.env.NEXT_PUBLIC_APP_URL}/organization/${data?.instructorId}/share/${data?._id}`}</Typography>
      ),
      col: 2,
      icon: 'ri-contacts-book-line',
      copy: data ? true : false,
      copyValue: `${process.env.NEXT_PUBLIC_APP_URL}/organization/${data?.instructorId}/share/${data?._id}`
    }
  ]

  return (
    <>
      <ShareContent
        about='enrollment plan'
        title={data?.title}
        items={items}
        buttons={buttons}
        hiddenInstructor
      ></ShareContent>
    </>
  )
}

export default PlanView
