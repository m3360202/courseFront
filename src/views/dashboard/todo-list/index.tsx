'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

// Component Imports
import type { ColumnDef } from '@tanstack/react-table'

import ListTable from '@components/list-table'

import type { TypeWithAction } from '@components/list-table/types'

import format from '@/utils/format'
import { useDictionary } from '@/hooks/useDictionary'
import { useParams, useRouter } from 'next/navigation'
import { useUser, useStudent } from '@/hooks/useGlobal'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@configs/i18n'
import NoWrapTitle from '@components/title/NoWrapTitle'
import { ToDoListResponse } from '@/types/calendar'
import { getTodoList } from '@/api/calendar'

const TodoList = ({ hiddenActions, source = 'dashboardPage' }: { hiddenActions?: boolean; source?: string }) => {
  //States
  const [data, setData] = useState<Array<ToDoListResponse>>()
  const [, setLoading] = useState<boolean>(false)

  //Hooks
  const user = useUser()
  const isStudent = useStudent()
  const { lang: locale } = useParams()
  const { replace } = useRouter()
  const fromDashBoard = source === 'dashboardPage'

  useEffect(() => {
    const loadTodoList = async () => {
      if (user) {
        setLoading(true)
        const params = {
          user,
          isStudent,
          type: 'ToDoList',
          includedCalenderEvent: false
        }
        const { data } = await getTodoList(params)
        setData(data)
        setLoading(false)
      }
    }
    loadTodoList()
  }, [user])

  const showDeadLine = (item: any) => {
    if (item.endDate) return format(new Date(item.endDate), undefined, true, 'MMM D HH:mm')
    else if (item.endTime) {
      return format(new Date(item.endTime), undefined, true, 'MMM D HH:mm')
    } else if (item.lessonDate) {
      const date =
        format(new Date(item.lessonDate), 'YYYY-MM-DD', false) +
        ' ' +
        format(new Date(item.lessonStartTime), 'HH:mm', false)

      return format(new Date(date), undefined, true, 'MMM D HH:mm')
    } else return 'No deadline'
  }

  //Vars
  const dictionary = useDictionary()

  const columns: ColumnDef<TypeWithAction, any>[] = [
    {
      id: 'title',
      header: dictionary.todo.title,
      cell: ({ row }) => <NoWrapTitle>{row.original.title}</NoWrapTitle>
    },
    {
      id: 'extendedProps.calendar',
      header: dictionary.todo.from,
      cell: ({ row }) => <NoWrapTitle>{row.original.extendedProps?.calendar}</NoWrapTitle>
    },
    {
      id: 'extendedProps.deadline',
      header: dictionary.todo.deadline,
      cell: ({ row }) => <NoWrapTitle>{showDeadLine(row.original)}</NoWrapTitle>
    }
  ]

  const handleRowClick = (row: TypeWithAction) => {
    const { id } = row
    const { courseId } = row.extendedProps
    let url = ''
    switch (row.extendedProps.calendar) {
      case 'Session':
        url = `/course/${courseId}/detail/session/${id}/view`
        break
      case 'Assignment':
        url = `/course/${courseId}/detail/assignment/${id}/view`
        break
      case 'Quiz':
        url = `/course/${courseId}/detail/quiz/${id}/view`
        break
      case 'Survey':
        url = `/course/${courseId}/detail/survey/${id}/view`
        break
    }
    replace(getLocalizedUrl(url, locale as Locale))
  }

  const sortColumns = (rows: TypeWithAction[]) => {
    return rows.sort((a, b) => {
      return a.title?.localeCompare(b.title)
    })
  }
  const sortColumn = sortColumns(columns) as ColumnDef<TypeWithAction, any>[]

  const tableData = fromDashBoard ? data?.slice(0, 6) : data

  const actionButtons = null

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable
          tableData={tableData}
          tableColumns={sortColumn}
          searchTitle='To-Do List'
          actionButtons={hiddenActions ? null : actionButtons}
          handleRowClick={handleRowClick}
          pagination={!fromDashBoard}
          title={fromDashBoard ? 'To-Do List' : ''}
        />
      </Grid>
    </Grid>
  )
}

export default TodoList
