import Share from '@/views/organization/share'

const ShareApp = ({ params }: { params: { shareId: string } }) => {
  //Props
  const { shareId } = params

  return <Share shareId={shareId} />
}

export default ShareApp
