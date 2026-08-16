import clsx from "clsx";

export interface SubHeaderProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SubHeader({ title, action, className }: SubHeaderProps) {
  return (
    <div className={clsx('mt-1 flex w-full items-center justify-between gap-2 px-4 py-3', className)}>
      {title && <h2 className='truncate text-base font-semibold text-primary-text'>{title}</h2>}
      {action && <div className='flex shrink-0 items-center gap-1'>{action}</div>}
    </div>
  );
}
