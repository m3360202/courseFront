// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Type Import
import { CustomInputImgData } from '@core/components/custom-inputs/types'

// Components Imports
import CustomInputImg from '@core/components/custom-inputs/Image'

const CustomCheckboxWithImage = ({
  imgData,
  handleChange
}: {
  imgData: CustomInputImgData[]
  handleChange: (value: string[]) => void
}) => {
  const initialSelected: string[] = imgData.filter(item => item.isSelected).map(item => item.value)

  // States
  const [selected, setSelected] = useState<string[]>(initialSelected)

  const change = (value: string) => {
    let values: string[] | null = null
    if (selected.includes(value)) {
      values = selected.filter(item => item !== value)
    } else {
      values = [...selected, value]
    }
    setSelected(values)
    handleChange(values)
  }

  return (
    <Grid container spacing={4}>
      {imgData.map((item, index) => (
        <CustomInputImg
          type='checkbox'
          key={index}
          data={item}
          selected={selected}
          name='custom-checkbox-img'
          handleChange={change}
          gridProps={{ sm: 4, xs: 12 }}
        />
      ))}
    </Grid>
  )
}

export default CustomCheckboxWithImage
