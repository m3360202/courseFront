import ViewSession from '@/views/course/detail/session/view'

const ViewSessionApp = ({ params }: { params: { sessionId: string } }) => <ViewSession sessionId={params.sessionId} />

export default ViewSessionApp
