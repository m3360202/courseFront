import SaveSession from '@/views/course/detail/session/component/SaveSession'

const EditSessionApp = ({ params }: { params: { sessionId: string } }) => <SaveSession sessionId={params.sessionId} />

export default EditSessionApp
