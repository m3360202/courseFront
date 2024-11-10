import type { ReactNode } from 'react'

const FormLayout = ({ className, children }: { className?: string; children: ReactNode }) => {
  return <div className={`w-full md:w-[70%] m-0 mx-auto ${className || ''}`}>{children}</div>
}

export default FormLayout
