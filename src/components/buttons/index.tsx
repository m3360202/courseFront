'use client'

import React from 'react'

import IconButton from '@mui/material/IconButton'
import { FileType } from '@/types/file/file'
import downloadFile from '@/utils/document/download'
import { error } from '@/utils/toasts'
import { getImg } from '@/utils/getImg'

export const ViewIcon = ({ ...rest }) => <i className={`ri-eye-line text-textSecondary ${rest.className}`} {...rest} />

export const EditButton = ({ ...rest }) => (
  <IconButton {...rest} title='Edit'>
    <i className='ri-pencil-line text-textSecondary' />
  </IconButton>
)

export const ViewButton = ({ ...rest }) => (
  <IconButton {...rest} title='View'>
    {<ViewIcon />}
  </IconButton>
)

const checkFile = (file?: FileType) => {
  if (!file || !file.final || !file.temporary) {
    error('File not found')

    return false
  }

  return true
}

export const FileViewButton = ({ file }: { file?: FileType }) => {
  if (!checkFile(file)) return

  return (
    <ViewButton
      onClick={() => {
        window.open(getImg(file?.temporary))
      }}
    />
  )
}

export const DownloadButton = ({ file, ...rest }: { file?: FileType }) => {
  if (!checkFile(file)) return

  return (
    <IconButton
      {...rest}
      title='Download'
      onClick={() => {
        downloadFile(getImg(file?.temporary), file?.final as string)
      }}
    >
      <i className='ri-download-2-line' />
    </IconButton>
  )
}
