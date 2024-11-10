import PolicyView from '@/views/organization/policy/view'

const EnrollmentPolicy = ({ params }: { params: { policyId: string } }) => <PolicyView policyId={params.policyId} />

export default EnrollmentPolicy
