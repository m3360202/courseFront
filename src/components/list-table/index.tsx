'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { useColorScheme } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import { Box, Skeleton, TextField, Typography } from '@mui/material'
import type { UsersType } from '@/types/apps/userTypes'
import { useUser } from '@/hooks/useGlobal'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import type { TypeWithAction } from './types'
import Title from '../title'
import { RemixIcon } from '../icon/remix-icon'

import { getSessionStatusText } from '@/utils/getSessionStatus'
import { useListTable } from '@/hooks/useListTable'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  loading: boolean
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return false ? (
    <Skeleton variant='text' width={150} height={40} />
  ) : (
    <div className=' flex flex-col gap-1'>
      <TextField
        {...props}
        value={value}
        onChange={e => setValue(e.target.value)}
        size='small'
        title={props.placeholder}
      />
    </div>
  )
}

// Column Definitions
const columnHelper = createColumnHelper<TypeWithAction>()

const ListTable = ({
  tableColumns,
  tableData,
  selectAll,
  actionButtons,
  searchTitle,
  pagination = true,
  title,
  noCard,
  realPage = false,
  handleRowClick,
  handleRowSelection,
  hasHeader = true
}: {
  tableColumns: ColumnDef<TypeWithAction, any>[] | undefined
  tableData?: { [key: string]: any }[]
  selectAll?: boolean
  actionButtons?: JSX.Element | null
  searchTitle?: string
  pagination?: boolean
  title?: string | JSX.Element
  noCard?: boolean
  realPage?: boolean
  handleRowClick?: (row: TypeWithAction) => void
  handleRowSelection?: (selections: TypeWithAction[]) => void,
  hasHeader?: boolean,
}) => {
  const user = useUser()
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [rowSelectionStore, setRowSelectionStore] = useState<Record<number, any>>({})
  const [data, setData] = useState<{ [key: string]: any }[]>([])
  const [filteredData, setFilteredData] = useState<{ [key: string]: any }[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const { mode } = useColorScheme()
  const { total, pageIndex, pageSize, setRowSelectionData, setPageIndex, setSearchValue, setPageSize } = useListTable()

  useEffect(() => {
    setPageIndex(0)
    setPageSize(20)
    setSearchValue('')
  }, [])

  // Hooks
  useEffect(() => {
    if (tableData) {
      setData(tableData)
      setFilteredData(tableData)
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [tableData])

  useEffect(() => {
    handleRowSelection && handleRowSelection(table.getSelectedRowModel()?.rows?.map(row => row.original))
    setRowSelectionStore(prevStore => ({
      ...prevStore,
      [pageIndex]: rowSelection
    }))
    setRowSelectionData((prevStore: any) => ({
      ...prevStore,
      [pageIndex]: table.getSelectedRowModel()?.rows?.map(row => row.original)
    }))


  }, [rowSelection])

  // 应用之前的行选择
  const applyPreviousSelection = (newPage: number) => {
    const newSelection: any = rowSelectionStore[newPage] || {}
    setRowSelection(newSelection)
  }

  // 页码更改时应用行选择
  const handlePageChange = (newPage: number) => {
    table.setPageIndex(newPage)
    setPageIndex(newPage)
    applyPreviousSelection(newPage)
  }

  // 分页大小更改时重置行选择
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageSize = Number(e.target.value)
    table.setPageSize(pageSize)
    setPageSize(pageSize)
    setPageIndex(0)
    setRowSelection({}) // 重置行选择
  }

  useEffect(() => {
    setSearchValue(globalFilter)
    setPageIndex(0)
  }, [globalFilter])

  const columns = useMemo<ColumnDef<TypeWithAction, any>[]>(
    () => {
      if (!tableColumns) return []

      const selectALLColunm: ColumnDef<TypeWithAction, any> = {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onClick: e => e.stopPropagation(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        ),
        enableSorting: false,
        maxSize: 50,
        size: 50
      }

      const finalTableColumns = selectAll ? [selectALLColunm, ...tableColumns] : [...tableColumns]

      return finalTableColumns.map(column =>
        columnHelper.accessor(column.id as string, {
          id: column.id,
          header: column.header,
          cell: column.cell,
          maxSize: column.maxSize,
          minSize: column.minSize,
          size: column.size,
          enableSorting: column.enableSorting
        })
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData, tableColumns]
  )

  const table = useReactTable({
    data: filteredData as UsersType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: realPage ? '' : globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 20
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Box component={noCard ? 'div' : Card}>
        {/* <CardHeader title='Filters' /> */}
        {/* <TableFilters setData={setFilteredData} tableData={data} /> */}
        {/* <Divider /> */}
        <div className='flex justify-between p-3 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          {typeof title !== 'object' ? <Title variant='h5'>{title}</Title> : title}
          <div className='flex justify-end gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={`Search ${searchTitle || ''}`}
              className='max-sm:is-full'
              loading={loading}
            />
            {/* <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-upload-2-line text-xl' />}
            className='max-sm:is-full'
          >
            Export
          </Button> */}
            <div className='flex pr-4 items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              {/* <Button variant='contained' onClick={() => setAddUserOpen(!addUserOpen)} className='max-sm:is-full'>
              Add New User
            </Button> */}
              {actionButtons}
            </div>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {hasHeader && table?.getHeaderGroups()?.map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {loading && (
              <tbody>
                <tr>
                  <td colSpan={table?.getVisibleFlatColumns()?.length} className='text-center'>
                    {[1, 2, 3].map(item => (
                      <Skeleton key={item} variant='text' width={'100%'} height={40} />
                    ))}
                  </td>
                </tr>
              </tbody>
            )}
            {!loading && table?.getFilteredRowModel()?.rows?.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table?.getVisibleFlatColumns()?.length} className='text-center'>
                    <div className='mx-auto flex items-center justify-center'>
                      <RemixIcon icon='ri-folder-forbid-line' sx={{ marginRight: '10px' }} />
                      <Typography>{`It's empty here`}</Typography>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {!loading &&
                  (pagination && !realPage
                    ? table?.getRowModel()?.rows?.slice(0, table?.getState()?.pagination?.pageSize)
                    : table?.getRowModel()?.rows
                  ).map(row => {
                    const sessionStatusLabel =
                      row.original.startTime && row.original.endTime
                        ? getSessionStatusText(row.original.startTime, row.original.endTime, user?.timeZone)
                        : ''
                    const rowStyle =
                      sessionStatusLabel === 'Expired' ? { backgroundColor: 'rgb(138 141 147 / 0.08)' } : {}

                    return (
                      <tr
                        key={row.id}
                        style={rowStyle}
                        className={
                          classnames({ selected: row.getIsSelected() }) +
                          ` ${mode === 'dark' ? 'hover:bg-primaryLighter' : 'hover:bg-gray-100'} ${handleRowClick ? ' cursor-pointer' : ' cursor-default'}`
                        }
                        onClick={() => {
                          handleRowClick && handleRowClick(row.original)
                        }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        {pagination && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component='div'
            className='border-bs'
            count={realPage ? total : table?.getFilteredRowModel()?.rows?.length}
            rowsPerPage={realPage ? pageSize : table?.getState()?.pagination?.pageSize}
            page={realPage ? pageIndex : table?.getState()?.pagination?.pageIndex}
            SelectProps={{
              inputProps: { 'aria-label': 'rows per page' }
            }}
            onPageChange={(_, page) => handlePageChange(page)} // 调用重置行选择的方法
            onRowsPerPageChange={handleRowsPerPageChange} // 调用重置行选择的方法
          />
        )}
      </Box>
    </>
  )
}

export default ListTable
