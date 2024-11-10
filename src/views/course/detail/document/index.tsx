'use client'

// React Imports
import { useState, useMemo, useEffect, useRef, SyntheticEvent, Dispatch, SetStateAction } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { Breadcrumbs, InputAdornment, Skeleton } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import TablePagination from '@mui/material/TablePagination'

// Type Imports
import { UserTable } from '@/types/user/UserTable'
import type { Document, DocumentProps } from '@/types/document'
import { DocumentType } from '@/types/document'
import { Folder } from '@/types/folder'
import { FILE_PATH } from '@/types'

// Style Imports

// Hooks Imports
import tableStyles from '@core/styles/table.module.css'
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import UserAvatar from '@/components/user-avatar'
import { useUser } from '@/hooks/useGlobal'

//API Import
import deleteFolder from '@/api/folder/deleteFolder'
import saveFolder from '@/api/folder/saveFolder'
import updateFolder from '@/api/folder/updateFolder'
import getFolders from '@/api/folder/getFolders'
import getDocuments from '@/api/document/getDocuments'
import addFolderDocument from '@/api/folder/addFolderDocument'
import deleteDocumentUnderFolder from '@/api/folder/deleteDocumentUnderFolder'

// Third Import
import Title from '@/components/title'
import { showFileTypeImg } from '@/utils/document/getFileType'
import { error, success } from '@/utils/toasts'
import OptionsMenu from '@core/components/option-menu'
import { RequiredStar } from '@/components/form-field'
import TargetDialog from '@/components/dialog'
import downloadFile from '@/utils/document/download'
import { OptionType } from '@/@core/components/option-menu/types'
import { RemixIcon } from '@/components/icon/remix-icon'
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
import type { ColumnDef, FilterFn, Row } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import format, { formatFileSize } from '@/utils/format'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type DocType = Document & Folder

type DocumentTypeWithAction = DocType & {
  action?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  if (row.original.name.indexOf(value) > -1) {
    addMeta({
      itemRank
    })
    // Return if the item should be filtered in/out

    return itemRank.passed
  } else {
    return false
  }
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
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

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper<DocumentTypeWithAction>()

const Document = ({ organizationId, userId, documentType = DocumentType.Course }: DocumentProps) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<Document[]>()
  const [folderData, setfolderData] = useState<Folder[]>()
  const [filteredData, setFilteredData] = useState<Document[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [lastFolderId, setLastFolderId] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const [saveFolderLoading, setSaveFolderLoading] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState<string>()
  const [folderId, setFolderId] = useState<string>()
  const [parentId, setParentId] = useState<string>()
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<null | string>(null)
  const [originId, setOriginId] = useState<string>()
  const [updataLoading, setUpdataLoading] = useState<boolean>(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const textFieldRef = useRef<HTMLInputElement>()

  // Hooks
  const user = useUser()
  const { courseId } = documentType === DocumentType.Course ? useCourse() : { courseId: '' }
  const editCourseRole = documentType === DocumentType.Course ? useEditCourseRole() : true

  const handleRenameFolder = async (folderId: string, id: string) => {
    if (textFieldRef && textFieldRef.current && textFieldRef.current.value) {
      setUpdataLoading(false)
      const folderName = textFieldRef.current.value
      await updateFolder(user as UserTable, folderId, { name: folderName, id })
      setUpdataLoading(true)
      setEditMode(false)
      setEditId(null)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    setEditMode(false)
    setEditId(null)
    await deleteFolder(user as UserTable, folderId)
    setfolderData(folderData?.filter(f => f._id !== folderId))
    setFilteredData(filteredData?.filter(f => f._id !== folderId))
    setFolderId(lastFolderId)
    setParentId(lastFolderId)
    success('Delete success')
  }

  const handleDeleteFolderDocument = async (item: any) => {
    if (item && item.folderId && item._id) {
      setEditMode(false)
      setEditId(null)
      await deleteDocumentUnderFolder(user as UserTable, item.folderId as string, item._id as string)
      setfolderData(folderData?.filter(f => f._id !== folderId))
      setFilteredData(filteredData?.filter(f => f._id !== folderId))
      setFolderId(lastFolderId)
      setParentId(lastFolderId)
      success('Delete success')
    }
  }

  const renderTitle = (
    folder: Folder,
    setFolderId: Dispatch<SetStateAction<string | undefined>>,
    setParentId: Dispatch<SetStateAction<string | undefined>>,
    folderId?: string
  ) => (
    <Box className='flex items-center'>
      <Title
        variant={folder._id === folderId ? 'h5' : 'h6'}
        className={`${folder._id === folderId ? 'cursor-default' : 'cursor-pointer'} mr-1 hover:text-blue-400 hover:border-b hover:border-b-blue-400`}
        onClick={() => {
          setFolderId(folder._id)
          setParentId(folder._id)
          setEditMode(false)
          setEditId(null)
        }}
      >
        {folder.name}
      </Title>
    </Box>
  )

  const loadFolders = async () => {
    if (user && originId) {
      const { data } = await getFolders(user, documentType as DocumentType, originId, folderId)
      setfolderData(data)
      const pid = data.find(c => !c.parentId)?._id
      if (!parentId) setParentId(pid)
      const { data: docData } = await getDocuments(user, documentType as DocumentType, originId, folderId || pid)
      setData(docData)
      setFilteredData(docData)
      setLoading(false)
    }
  }

  const menuOptions = (row: Row<DocumentTypeWithAction>) => {
    const opts: OptionType[] = []
    if (!row.original.isFolder) {
      opts.push(
        ...[
          {
            text: 'View',
            menuItemProps: {
              onClick: () => {
                window.open(FILE_PATH + row.original.temporary)
              }
            }
          },
          {
            text: 'Download',
            menuItemProps: {
              onClick: () => {
                downloadFile(FILE_PATH + row.original.temporary, row.original.name)
              }
            }
          }
        ]
      )
    }
    opts.push({
      text: 'Rename',
      menuItemProps: {
        onClick: (e: any) => {
          e.stopPropagation()
          setEditId(row.original._id)
          setEditMode(true)
        }
      }
    })
    opts.push({
      text: 'Delete',
      menuItemProps: {
        onClick: async (e: any) => {
          e.stopPropagation()
          if (row.original.isFolder) {
            await handleDeleteFolder(row.original._id)
          } else {
            await handleDeleteFolderDocument(row.original)
          }
        }
      }
    })

    return opts
  }

  const columns = useMemo<ColumnDef<DocumentTypeWithAction, any>[]>(
    () => {
      const cols: ColumnDef<DocumentTypeWithAction, any>[] = [
        columnHelper.accessor('name', {
          header: 'FileName',
          cell: ({ row }) => (
            <div className='gap-4'>
              {editMode && editId === row.original._id ? (
                <div className='flex items-center gap-4'>
                  <TextField inputRef={textFieldRef} defaultValue={row.original.name} />
                  <LoadingButton
                    loading={uploadLoading}
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-upload-2-line' />}
                    size='small'
                    sx={{ marginLeft: '10px' }}
                    onClick={async () => {
                      if (
                        textFieldRef &&
                        textFieldRef.current &&
                        textFieldRef.current.value &&
                        row.original.name !== textFieldRef.current.value
                      ) {
                        await handleRenameFolder(row.original.folderId || row.original._id, row.original._id) // 如果名称有变化，在失去焦点时调用保存方法
                      } else {
                        setEditMode(false)
                        setEditId(null)
                      }
                    }}
                  >
                    save
                  </LoadingButton>
                </div>
              ) : (
                <div className='flex items-center gap-4'>
                  {showFileTypeImg(row.original.isFolder, row.original.name)}
                  <Title color='text.primary'>{row.original.name}</Title>
                </div>
              )}
            </div>
          )
        }),
        columnHelper.accessor('postedByUser.username', {
          header: 'By',
          cell: ({ row }) => (
            <UserAvatar
              name={row.original.postedByUser?.nickName || row.original.postedByUser?.username}
              userImg={row.original.postedByUser?.userImg}
              email={row.original.postedByUser?.email}
            />
          )
        }),
        columnHelper.accessor('size', {
          header: 'Size',
          cell: ({ row }) => formatFileSize(row.original.size)
        }),
        columnHelper.accessor('postAt', {
          header: 'Upload time',
          cell: ({ row }) => format(row.original.postAt)
        })
      ]
      if (editCourseRole)
        cols.push(
          columnHelper.accessor('_id', {
            header: 'Action',
            cell: ({ row }) => <OptionsMenu iconClassName='text-textPrimary' options={menuOptions(row)} />
          })
        )

      return cols
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData, editMode, saveFolderLoading]
  )

  const table = useReactTable({
    data: filteredData as Document[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
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

  const handleUploadFiles = async (files: File[]) => {
    setUploadLoading(true)
    const { success: result, message } = await addFolderDocument(
      user as UserTable,
      (folderId || parentId) as string,
      files
    )
    if (!result && message) {
      error(message)
      setUploadLoading(false)

      return
    }
    success('Upload file successful!')
    setUploadLoading(false)
  }

  const handleSaveFolder = async () => {
    if (!folderName) {
      setFolderName('')

      return
    }
    setSaveFolderLoading(true)
    const {
      data,
      success: result,
      message
    } = await saveFolder(
      user as UserTable,
      null,
      folderName as string,
      documentType as DocumentType,
      originId as string,
      parentId
    )
    if (!result && message) {
      error(message)

      return
    }

    if (documentType === DocumentType.Course) {
      setParentId(data._id)
      setFolderId(data._id)
    }

    success('Add folder successful!')
    setOpen(false)
    setSaveFolderLoading(false)
  }

  const breadcrumbs = () => {
    return (
      <Breadcrumbs separator={<i className='ri-arrow-right-s-line'></i>} aria-label='breadcrumb'>
        {folderData?.map(folder => {
          const titleElement = renderTitle(folder, setFolderId, setParentId, folderId)

          return titleElement
        })}
      </Breadcrumbs>
    )
  }

  useEffect(() => {
    loadFolders()
  }, [user, originId, saveFolderLoading, uploadLoading, folderId, updataLoading])

  const handleClose = (event: Event | SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  useEffect(() => {
    if (documentType === DocumentType.Organization && organizationId) {
      setOriginId(organizationId)
    } else if (documentType === DocumentType.Person && userId) {
      setOriginId(userId)
    } else setOriginId(courseId)
  }, [documentType, courseId, organizationId, userId])

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-col gap-6'>
          <div className='flex items-center'>
            <RemixIcon sx={{ marginRight: '10px' }} icon='ri-folder-4-line' />
            {breadcrumbs()}
          </div>

          <div className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
            {editCourseRole && (
              <div className='flex gap-4'>
                <TargetDialog
                  title='New folder'
                  width={'30%'}
                  height={'30%'}
                  open={open}
                  setOpen={setOpen}
                  content={
                    <>
                      <div className='p-2'>
                        <div className='flex flex-col gap-5'>
                          <TextField
                            fullWidth
                            label='Folder name'
                            InputProps={{
                              startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
                              // endAdornment: (
                              //   <div className='flex'>
                              //     <IconButton onClick={handleSaveFolder}>
                              //       <i className='ri-checkbox-circle-line'></i>
                              //     </IconButton>
                              //     <IconButton onClick={handleClose}>
                              //       <i className='ri-close-circle-line'></i>
                              //     </IconButton>
                              //   </div>
                              // )
                            }}
                            {...(folderName == '' && {
                              error: true,
                              helperText: 'The field is required'
                            })}
                            onChange={e => {
                              setFolderName(e.target.value)
                            }}
                            onKeyDown={async e => {
                              if (e.key === 'Enter') {
                                await handleSaveFolder()
                              }
                            }}
                          />
                          <div className='flex gap-5 justify-end'>
                            <Button onClick={handleClose} variant='outlined' color='secondary'>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveFolder} variant='contained'>
                              Confirm
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  }
                >
                  <Button
                    ref={anchorRef}
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-folder-add-line' />}
                    size='small'
                  // onClick={handleToggle}
                  >
                    New folder
                  </Button>
                </TargetDialog>
                <LoadingButton
                  loading={uploadLoading}
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-upload-2-line' />}
                  size='small'
                >
                  <label>
                    File Upload
                    <input
                      type='file'
                      style={{ display: 'none' }}
                      multiple
                      onChange={async e => {
                        await handleUploadFiles(e.target.files as unknown as File[])
                      }}
                    />
                  </label>
                </LoadingButton>
              </div>
            )}
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={`Search file`}
              className='max-sm:is-full'
            />
          </div>
        </CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{ backgroundColor: '#FFFFFF', borderBottom: 'solid 1px rgb(46 38 61 / 0.12)' }}
                    >
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
            {!loading && table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {!loading &&
                  table.getRowModel().rows.map(row => {
                    return (
                      <tr
                        key={row.id}
                        className={
                          classnames({ selected: row.getIsSelected() }) +
                          ` hover:bg-gray-100 ${row.original.isFolder ? ' cursor-pointer' : ' cursor-default'}`
                        }
                        onClick={() => {
                          if (row.original.isFolder && !editMode) {
                            setLastFolderId(folderId as string)
                            setFolderId(row.original._id)
                            setParentId(row.original._id)
                          }
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>
    </>
  )
}

export default Document
