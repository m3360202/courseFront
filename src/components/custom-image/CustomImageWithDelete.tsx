// Type Import
import { CustomInputImgData } from '@core/components/custom-inputs/types'

// Components Imports
import CustomInputImg from '@core/components/custom-inputs/Image'

const CustomImageWithDelete = ({
  imgData,
  className,
  handleChange
}: {
  imgData: CustomInputImgData[]
  className?: string
  handleChange: (value: string) => void
}) => {
  return (
    <div className={className}>
      {imgData.map((item, index) => (
        <CustomInputImg
          type='delete'
          key={index}
          data={item}
          selected=''
          name='custom-checkbox-img'
          handleChange={handleChange}
          gridProps={{ sm: 4, xs: 12 }}
        />
      ))}
    </div>
  )
}

export default CustomImageWithDelete
