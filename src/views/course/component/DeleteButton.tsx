import ConfirmDialog from '@/components/confirm'
import { IconButton } from '@mui/material'

const DeleteButton = ({ id, items, replace }: { id: string; items: Array<any>; replace: any }) => (
  <ConfirmDialog
    confirm={() => {
      replace(items?.filter(c => c._id !== id))
    }}
  >
    <IconButton size='small'>
      <i className='ri-close-line text-actionActive text-2xl' />
    </IconButton>
  </ConfirmDialog>
)

export default DeleteButton
