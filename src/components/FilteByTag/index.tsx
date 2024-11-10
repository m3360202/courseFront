import { getLabels } from '@/api/label/getLabels'
import { useUser } from '@/hooks/useGlobal'
import { Label } from '@/types/label'
import { UserTable } from '@/types/user/UserTable'
import { Autocomplete, Checkbox, TextField } from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type Props = {
  organizationId?: string
  data: Array<any> | undefined
  setData: Dispatch<SetStateAction<Array<any> | undefined>>
}
const FilterByTag = (props: Props) => {
  //Props
  const { organizationId, data, setData } = props

  //States
  const [labels, setLabels] = useState<Label[]>()
  const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean | undefined>(false)
  const [defaultValue, setDefaultValue] = useState<Label[]>([])

  //Hooks
  const user = useUser()

  const loadLabels = async () => {
    if (user) {
      const { data } = await getLabels(user, organizationId || user._id, true)
      setLabels(data)
    }
  }

  useEffect(() => {
    loadLabels()
  }, [organizationId])

  return (
    <Autocomplete
      id='labels'
      multiple
      disableClearable={false}
      disableCloseOnSelect
      options={labels || []}
      open={autoCompleteOpen}
      // filterOptions={x =>
      //   x.filter(c => (!searchValue ? true : c.title?.toLowerCase().includes(searchValue.toLowerCase())))
      // }
      defaultValue={defaultValue}
      value={defaultValue}
      getOptionLabel={option => option.title}
      renderOption={(props, option, { selected }) => (
        <>
          <li {...props}>
            <Checkbox
              icon={<i className='ri-checkbox-blank-line' />}
              checkedIcon={<i className='ri-checkbox-line' />}
              style={{ marginRight: 8 }}
              checked={selected || defaultValue?.find((c: any) => c._id === option._id) !== undefined}
            />
            {option.title}
          </li>
        </>
      )}
      style={{ width: 200 }}
      renderInput={params => (
        <TextField
          {...params}
          label='Filter By Tags'
          placeholder='Filter By Tags'
          onChange={e => {
            if (!e.target.value) setAutoCompleteOpen(false)
            else setAutoCompleteOpen(true)
          }}
          onClick={() => {
            setAutoCompleteOpen(true)
          }}
        />
      )}
      onChange={(e, value) => {
        setDefaultValue(value)
        if (!value || value.length === 0) {
          setData(data)

          return
        }
        const titles = value?.map(v => v.title)
        const filterData = data?.filter(c => {
          return titles.every((title: any) => (c.userId as UserTable)?.labels?.some(label => label.title === title))
        })
        setData(filterData)
      }}
      onBlur={() => {
        setAutoCompleteOpen(false)
      }}
    />
  )
}

export default FilterByTag
