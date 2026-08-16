import clsx from "clsx";
import { ArrowLeft } from "react-feather";

import { IconContainer } from "@/components/Atoms/IconContainer";

export interface HeaderProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Header({ children, title, subtitle, onBack, backLabel = "Voltar", action, className }: HeaderProps) {
  return (
    <header
      className={clsx(
        "bg-secondary flex w-full items-center shadow-md p-4 safe-top z-10 space-x-2 min-h-16",
        className
      )}
    >
      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            {onBack && (
              <IconContainer
                icon={<ArrowLeft size={22} className='cursor-pointer text-primary' />}
                onClick={onBack}
                ariaLabel={backLabel}
              />
            )}
            <div className='flex min-w-0 flex-1 flex-col'>
              {title && <h1 className='flex items-center truncate text-xl font-semibold text-primary-text'>{title}</h1>}
              {subtitle && (
                <p className='flex items-center truncate text-sm font-normal text-muted'>{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className='shrink-0'>{action}</div>}
        </div>
      </div>
      {children}
    </header>
  );
}
