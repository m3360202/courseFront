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
import { getEnrollmentPolicys } from '@/api/organization/enrollment-policy/getEnrollmentPolicys'
import { EnrollmentPolicy } from '@/types/organization/enrollment/policy'
import { publishEnrollmentPolicy } from '@/api/organization/enrollment-policy/publishEnrollmentPolicy'
import { saveEnrollmentPolicy } from '@/api/organization/enrollment-policy/saveEnrollmentPolicy'
import { deleteEnrollmentPolicy } from '@/api/organization/enrollment-policy/deleteEnrollmentPolicy'

const EnrollmentPolicyList = () => {
  //States
  const [data, setData] = useState<Array<EnrollmentPolicy>>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [duplicateLoading, setDuplicateLoading] = useState(false)

  //Hooks
  const user = useUser()
  const dictionary = useDictionary()
  const { lang: locale, organizationId } = useParams()
  const { replace } = useRouter()
  const { setBackUrl, setTitle } = useGlobal()

  const menuOptions = (row: Row<TypeWithAction>) => {
    const options: OptionType[] = []
    options.push({
      text: 'Duplicate',
      menuItemProps: {
        onClick: async () => await handleDuplicate(row.original as EnrollmentPolicy)
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
    setTitle('Enrollment Policy')

    return () => {
      setBackUrl(null)
    }
  }, [])

  useEffect(() => {
    const loadPolicys = async () => {
      if (user && organizationId) {
        const { data } = await getEnrollmentPolicys(user, organizationId as string)
        setData(data)
      }
    }
    loadPolicys()
  }, [user, deleteLoading, publishLoading, organizationId, duplicateLoading])

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
      id: 'isPublish',
      header: ' ',
      cell: ({ row }) =>
        row.original.isPublish ? (
          <></>
        ) : (
          <Chip
            size='small'
            label={row.original.isPublish ? '' : 'draft'}
            color={row.original.isPublish ? 'success' : 'error'}
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
      href={getLocalizedUrl(`/organization/${organizationId}/detail/enrollment-policy/add`, locale as Locale)}
    />
  )

  const handleDelete = async (policyId: string) => {
    try {
      setDeleteLoading(true)
      await deleteEnrollmentPolicy(user as UserTable, policyId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRowClick = (row: TypeWithAction) => {
    const url = `/organization/${organizationId}/detail/enrollment-policy/${row._id}/view`

    replace(getLocalizedUrl(url, locale as Locale))
  }

  const handlePublish = async (row: TypeWithAction) => {
    setPublishLoading(true)
    await publishEnrollmentPolicy(user as UserTable, row._id, !row.isPublish)
    success(!row.isPublish ? 'Published!' : 'UnPublished!')
    setPublishLoading(false)
  }

  const handleDuplicate = async (row: EnrollmentPolicy) => {
    const withoutId = { ...row }
    delete withoutId._id
    withoutId.title = withoutId.title + 'Copy'
    setDuplicateLoading(true)
    await saveEnrollmentPolicy(user as UserTable, withoutId)
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

export default EnrollmentPolicyList
