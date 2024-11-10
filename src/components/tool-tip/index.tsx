import { styled } from '@mui/material/styles'
//@ts-ignore
import Tooltip from '@mui/material/Tooltip'
//@ts-ignore
import type { TooltipProps } from '@mui/material/Tooltip'
import { tooltipClasses } from '@mui/material/Tooltip'

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#ffffff',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '1rem',
    border: '1px solid #dadde9'
  }
}))

export default function CustomizedTooltip({ title, children, placement }: { title: string | JSX.Element; children: JSX.Element; placement?: TooltipProps['placement'] }) {
  return <HtmlTooltip title={title} placement={placement}>{children}</HtmlTooltip>
}
