'use client'

import PermissionButton from '@/components/buttons/PermissionButton'
import ListTable from '@/components/list-table'
import { TypeWithAction } from '@/components/list-table/types'
import NoWrapTitle from '@/components/title/NoWrapTitle'
import { Locale } from '@/configs/i18n'
import { useDictionary } from '@/hooks/useDictionary'
import { useGlobal } from '@/hooks/useGlobal'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { getLocalizedUrl } from '@/utils/i18n'
import { success } from '@/utils/toasts'
import { Chip, Grid, IconButton } from '@mui/material'
import type { ColumnDef, Row } from '@tanstack/react-table'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OptionsMenu from '@core/components/option-menu'
import { OptionType } from '@/@core/components/option-menu/types'
import { Enrollment } from '@/types/organization/enrollment'
import { getEnrollments } from '@/api/organization/enrollment/getEnrollmens'
import saveEnrollment from '@/api/organization/enrollment/saveEnrollment'
import { publishEnrollment } from '@/api/organization/enrollment/publishEnrollment'
import { deleteEnrollment } from '@/api/organization/enrollment/deleteEnrollment'
import { showChipLabel } from '@/utils/organization'
import { activeEnrollment } from '@/api/organization/enrollment/activeEnrollment'

const EnrollmentPlanList = () => {
  //States
  const [data, setData] = useState<Array<Enrollment>>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const [activeLoading, setActiveLoading] = useState(false)

  //Hooks
  const user = useUser()
  const dictionary = useDictionary()
  const { lang: locale, organizationId } = useParams()
  const { replace } = useRouter()
  const { setBackUrl, setTitle } = useGlobal()

  const menuOptions = (row: Row<TypeWithAction>) => {
    const options: OptionType[] = []
    if (row.original.invalid) {
      options.push({
        text: 'Active',
        confirm: async () => {
          setActiveLoading(true)
          await activeEnrollment(user as UserTable, row.original._id)
          setActiveLoading(false)
        }
      })
    }
    options.push({
      text: 'Duplicate',
      menuItemProps: {
        onClick: async () => await handleDuplicate(row.original as Enrollment)
      }
    })

    options.push({
      text: 'Delete',
      confirmText: dictionary.common.delete,
      confirm: async () => {
        await handleDelete(row.original._id)
      }
    })

    return options
  }

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, locale as Locale)])
    setTitle('Enrollment Plan')

    return () => {
      setBackUrl(null)
    }
  }, [])

  useEffect(() => {
    const loadPlans = async () => {
      if (user && organizationId) {
        const { data } = await getEnrollments(user, organizationId as string)
        setData(data)
      }
    }
    loadPlans()
  }, [user, deleteLoading, publishLoading, organizationId, duplicateLoading, activeLoading])

  const status = (item: Enrollment | undefined) => showChipLabel(item, user)

  //Vars
  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className='flex gap-2 items-center'>
          <NoWrapTitle>{row.original.title}</NoWrapTitle>
          <IconButton
            onClick={async e => {
              e.stopPropagation()
              await handlePublish(row.original)
            }}
          >
            <i className={row.original.isPublish ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
          </IconButton>
        </div>
      )
    },
    {
      id: 'courses',
      header: 'Course',
      cell: ({ row }) => row.original.courses?.map((course: any) => course.title).join(',')
    },
    {
      id: 'surveys',
      header: 'Survey',
      cell: ({ row }) => row.original.surveys?.map((survey: any) => survey.title).join(',')
    },
    {
      id: 'isPublish',
      header: 'Status',
      cell: ({ row }) => (
        <Chip
          size='small'
          label={
            row.original.invalid
              ? 'Manual ' + status(row.original as Enrollment).title
              : status(row.original as Enrollment).title
          }
          color={status(row.original as Enrollment).color as any}
          variant='tonal'
        />
      )
    },

    {
      header: dictionary.common.action,
      cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
    }
  ]

  const actionButtons = (
    <PermissionButton
      variant='contained'
      title={dictionary.common.createNew}
      text={dictionary.common.createNew}
      isShow={true}
      component={Link}
      href={getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-plan/add`, locale as Locale)}
    />
  )

  const handleDelete = async (planId: string) => {
    try {
      setDeleteLoading(true)
      await deleteEnrollment(user as UserTable, planId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRowClick = (row: TypeWithAction) => {
    const url = `/organization/${organizationId}/detail/enrollment-plan/${row._id}/view`

    replace(getLocalizedUrl(url, locale as Locale))
  }

  const handlePublish = async (row: TypeWithAction) => {
    setPublishLoading(true)
    await publishEnrollment(user as UserTable, row._id, !row.isPublish)
    success(!row.isPublish ? 'Published!' : 'UnPublished!')
    setPublishLoading(false)
  }

  const handleDuplicate = async (row: Enrollment) => {
    const withoutId = { ...row }
    delete withoutId._id
    withoutId.title = withoutId.title + 'Copy'
    setDuplicateLoading(true)
    await saveEnrollment(user as UserTable, withoutId)
    setDuplicateLoading(false)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={data}
          tableColumns={columns}
          searchTitle='Policy'
          handleRowClick={handleRowClick}
          actionButtons={actionButtons}
        />
      </Grid>
    </Grid>
  )
}

export default EnrollmentPlanList
