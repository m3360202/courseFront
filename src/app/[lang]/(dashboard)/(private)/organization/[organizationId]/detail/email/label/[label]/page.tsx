// Component Imports
import EmailWrapper from '@views/organization/email'

const EmailLabelPage = ({ params }: { params: { label: string } }) => {
  return <EmailWrapper label={params.label} />
}

export default EmailLabelPage
