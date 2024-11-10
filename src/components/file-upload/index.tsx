import type { ForwardRefRenderFunction } from 'react'

import { forwardRef } from 'react'

import type { ButtonProps } from '@mui/material'
import { LoadingButton } from '@mui/lab'

type Props = {
  loading: boolean
  multiple?: boolean
  title?: string
  rest?: any
  imageClassName?: string
  accept?: string
  handleUploadFiles: (files: File[]) => Promise<void>
}

const FileUpload: ForwardRefRenderFunction<HTMLLIElement, ButtonProps & Props> = props => {
  const { title, imageClassName, accept, ...rest } = props
  const key = new Date().getTime()

  return (
    <LoadingButton
      variant='outlined'
      color='secondary'
      size='small'
      {...props}
      {...rest}
      onClick={() => {
        const input = document.getElementById(key.toString())
        if (input) {
          input.click()
        }
      }}
    >
      <label
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer'
        }}
      >
        <i className={`ri-upload-2-line w-4 h-4 ` + imageClassName} />
        {title ? title : 'Upload'}
      </label>
      <input
        type='file'
        id={key.toString()}
        style={{ display: 'none' }}
        multiple={props.multiple ? true : false}
        accept={accept}
        onChange={async e => {
          await props.handleUploadFiles(e.target.files as unknown as File[])
        }}
      />
    </LoadingButton>
  )
}

export default forwardRef(FileUpload)
