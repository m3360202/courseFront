import MuiChip from '@mui/material/Chip'
import CustomizedTooltip from '@/components/tool-tip'

const renderChip = (data?: { title: string }[], maxWidth?: number | string, isCol?: boolean) => (
  <div className={`flex gap-1 ${isCol ? 'flex-col' : ''}`}>
    {data?.map(
      item =>
        item.title && (
          <MuiChip
            key={item.title}
            size='small'
            label={item.title}
            variant='tonal'
            color={'info'}
            sx={{ maxWidth: maxWidth ?? 80 }}
          />
        )
    )}
  </div>
)

const Chips = ({ data, maxWidth }: { data?: { title: string }[]; maxWidth?: number }) => {
  if (!data?.length) return null
  const result = data?.filter(item => item.title)

  return (
    <CustomizedTooltip title={renderChip(result, '100%', true)} placement='left'>
      {renderChip(result?.slice(0, 3), maxWidth)}
    </CustomizedTooltip>
  )
}

export default Chips
