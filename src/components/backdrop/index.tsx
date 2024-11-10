import { Backdrop, CircularProgress } from '@mui/material'

const BackdropLoading = ({ loading }: { loading: boolean }) =>
  loading ? (
    <Backdrop open={true} className='absolute text-white z-10 bg-textDisabled'>
      <CircularProgress color='inherit' />
    </Backdrop>
  ) : null

export default BackdropLoading
