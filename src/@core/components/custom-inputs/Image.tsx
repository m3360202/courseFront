// MUI Imports
import Checkbox from '@mui/material/Checkbox'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { CustomInputImgProps } from './types'
import { IconButton } from '@mui/material'

const Root = styled('div', {
  name: 'MuiCustomImage',
  slot: 'Root'
})({
  blockSize: '100%',
  display: 'flex',
  borderRadius: 'var(--mui-shape-borderRadius)',
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',

  border: '1px solid var(--mui-palette-customColors-inputBorder)',

  '&:hover': {
    borderColor: 'var(--mui-palette-action-active)',
    '& img': {
      opacity: 0.2
    },
    '& .MuiButtonBase-root': {
      opacity: 1
    }
  },
  '&.active': {
    borderColor: 'var(--mui-palette-primary-main)'
  },
  '&:not(.active):not(:hover) .MuiCheckbox-root': {
    display: 'none'
  },
  '&:not(.active):not(:hover) .MuiButtonBase-root': {
    display: 'none'
  }
})

const CheckboxInput = styled(Checkbox, {
  name: 'MuiCustomImage',
  slot: 'Input'
})({
  top: 7,
  right: 7,
  position: 'absolute',
  backgroundColor: 'rgba(0, 0, 0, 1)'
})

const DeleteInput = styled(IconButton, {
  name: 'MuiCustomImage',
  slot: 'Input'
})({
  top: 4,
  right: 7,
  position: 'absolute',
  opacity: '1 !important'
})

const Image = styled('img', {
  name: 'MuiCustomImage',
  slot: 'Image'
})({
  maxWidth: '100%'
})

const CustomCheckboxImg = (props: CustomInputImgProps) => {
  // Props
  const { type, data, name, selected, handleChange, color = 'primary' } = props

  // Vars
  const { alt, img, value } = data

  const renderComponent = () => {
    return (
      <Root className={classnames({ active: selected.includes(value) })}>
        {typeof img === 'string' ? (
          <Image src={img} alt={alt ?? `checkbox-image-${value}`} width={100} height={55} />
        ) : (
          img
        )}

        {type === 'checkbox' && (
          <CheckboxInput
            color={color}
            name={`${name}-${value}`}
            checked={selected.includes(value)}
            onChange={() => handleChange(value)}
          />
        )}
        {type === 'delete' && (
          <DeleteInput onClick={() => handleChange(value)} name={`${name}-${value}`}>
            <i className='ri-delete-bin-7-line text-textSecondary' />
          </DeleteInput>
        )}
      </Root>
    )
  }

  return data ? renderComponent() : null
}

export default CustomCheckboxImg
