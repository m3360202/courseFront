'use client'

// React Imports
import { Dispatch, useEffect, SetStateAction } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { FileType } from '@/types/file/file'
import { formatFileSize } from '@/utils/format'
import { showFileTypeImg } from '@/utils/document/getFileType'
import ConfirmDialog from '../confirm'
import { FILE_PATH } from '@/types'
import { DownloadButton, FileViewButton } from '../buttons'

interface Props {
  files?: FileType[] | undefined
  setFiles?: Dispatch<SetStateAction<FileType[] | undefined>>
}

const FileList = ({ files, setFiles }: Props) => {
  //Hooks
  useEffect(() => {
    setFiles && setFiles(files)
  }, [files])

  const handleRemoveFile = (file: FileType) => {
    const filtered = files?.filter((i: FileType) => i.temporary !== file.temporary) || []
    setFiles && setFiles([...filtered])
  }

  const fileItems = files?.map((file: FileType) => (
    <ListItem key={file.temporary} className='flex justify-between'>
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          window.open(FILE_PATH + file.temporary)
        }}
      >
        <div className='flex mr-3'>{showFileTypeImg(false, file.final)}</div>
        <div>
          <Typography className='font-semibold' color='text.primary'>
            {file.final}
          </Typography>
          <Typography className='file-size' variant='body2'>
            {formatFileSize(file.size)}
          </Typography>
        </div>
      </div>
      <div className='flex gap-2'>
        <FileViewButton file={file} />
        <DownloadButton file={file} />
        {setFiles && (
          <ConfirmDialog
            title='Delete'
            confirm={() => {
              handleRemoveFile(file)
            }}
          >
            <IconButton title='Delete'>
              <i className='ri-close-line text-xl' />
            </IconButton>
          </ConfirmDialog>
        )}
      </div>
    </ListItem>
  ))

  return (files ?? []).length ? (
    <>
      <List>{fileItems}</List>
    </>
  ) : null
}

export default FileList
