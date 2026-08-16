import clsx from "clsx"

interface IconContainerCopyProps extends React.ComponentPropsWithoutRef<'div'> {
  icon: React.ReactNode
  ariaLabel?: string
}

export const IconContainer = ({ icon, className, ariaLabel, ...rest }: IconContainerCopyProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex items-center justify-center min-h-[48px] min-w-[48px] p-3 rounded-full cursor-pointer active:scale-[0.96] transition-transform',
        className
      )}
      {...rest}
    >
      {icon}
    </div>
  )
}