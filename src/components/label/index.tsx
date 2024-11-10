import { useEffect, useState } from 'react'

import type { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material'
import { Autocomplete, Checkbox, TextField } from '@mui/material'

import { cloneDeep } from 'lodash'

import { getLabels } from '@/api/label/getLabels'
import { saveLabel } from '@/api/label/saveLabel'
import type { Label } from '@/types/label'
import type { UserTable } from '@/types/user/UserTable'
import { useUser } from '@/hooks/useGlobal'

export const Tag = ({
  multiple = true,
  organizationId,
  defaultValue,
  onChange
}: {
  multiple?: boolean
  organizationId?: string
  defaultValue?: Label[] | Label
  onChange: (value: Label[] | Label) => void
}) => {
  //States
  const [labels, setLabels] = useState<Label[] | null>(null)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<Label[] | Label>()
  const [searchValue, setSearchValue] = useState('')

  //Hooks
  const user = useUser()

  useEffect(() => {
    if (defaultValue) setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    const loadLabels = async () => {
      if (user) {
        const result = await getLabels(user, organizationId || user._id)

        setLabels(result?.data)
      }
    }

    loadLabels()
  }, [user])

  useEffect(() => {
    value && onChange(value)
  }, [value])

  let i = 0

  const renderLabel = (props?: any) => {
    return searchValue && !labels?.find(c => c.title === searchValue) ? (
      <li
        {...props}
        style={{ marginRight: 8, 'list-style-type': 'none', cursor: 'pointer' }}
        onClick={async () => {
          await saveLabel(user as UserTable, { id: (organizationId || user?._id) as string, title: searchValue })
          const { data } = await getLabels(user as UserTable, organizationId || (user?._id as string))
          const currentLabel = data?.find(c => c.title === searchValue) as Label
          if (multiple) {
            const dv = cloneDeep(value as Label[])
            dv?.push(currentLabel)
            setValue(dv)
          } else setValue(currentLabel)
        }}
      >
        <Checkbox
          icon={<i className='ri-add-circle-line'></i>}
          checkedIcon={<i className='ri-checkbox-line'></i>}
          style={{ marginRight: 8 }}
        />
        {searchValue}
        {/* <AddCircleOutlineOutlinedIcon />
    <Typography>{searchValue}</Typography> */}
      </li>
    ) : undefined
  }

  const renderNoOptionLabel = () => renderLabel()

  const renderOptionLabel = (props?: any) => {
    i++
    const result = i === 1 && searchValue ? renderLabel(props) : undefined

    return result
  }

  return (
    <Autocomplete
      id='labels'
      multiple={multiple}
      disableClearable={true}
      disableCloseOnSelect
      options={labels || []}
      open={open}
      defaultValue={value}
      value={value}
      getOptionLabel={option => (option as Label).title}
      noOptionsText={renderNoOptionLabel()}
      renderOption={(props, option, { selected }) => (
        <>
          {renderOptionLabel(props)}
          <li {...props}>
            <Checkbox
              icon={<i className='ri-checkbox-blank-line'></i>}
              checkedIcon={<i className='ri-checkbox-line'></i>}
              style={{ marginRight: 8 }}
              checked={
                selected ||
                (multiple
                  ? (value as Label[])?.find((c: any) => c._id === (option as Label)._id) !== undefined
                  : (value as Label)?._id === (option as Label)._id)
              }
            />
            {(option as Label).title}
          </li>
        </>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label='Course label'
          placeholder='Course label'
          onChange={e => {
            if (!e.target.value) setOpen(false)
            else setOpen(true)
            setSearchValue(e.target.value)
          }}
          onClick={() => {
            setOpen(true)
          }}
        />
      )}
      onChange={(
        e: any,
        value: any,
        reason: AutocompleteChangeReason,
        list: AutocompleteChangeDetails<any> | undefined
      ) => {
        if (reason === 'removeOption') {
          const option = list?.option as any
          saveLabel(user as UserTable, {
            _id: option._id,
            id: option.id,
            title: option.title,
            isSelected: false
          })
        }
        setValue(value)
        !multiple && setOpen(false)
      }}
      onBlur={() => {
        setOpen(false)
      }}
    />
  )
}

export default Tag
