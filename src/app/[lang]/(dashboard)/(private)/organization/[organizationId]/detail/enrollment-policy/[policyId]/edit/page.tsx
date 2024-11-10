import SavePolicy from '@/views/organization/policy/component/SavePolicy'

const EnrollmentPolicy = ({ params }: { params: { policyId: string } }) => <SavePolicy policyId={params.policyId} />

export default EnrollmentPolicy
