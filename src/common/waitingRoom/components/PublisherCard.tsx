import clsx from 'clsx';
import type { ReactNode } from 'react';

interface PublisherCardProps {
  primary: ReactNode;
  secondary?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function PublisherCard({ primary, secondary, trailing, onClick, className, ariaLabel }: PublisherCardProps) {
  const interactive = typeof onClick === 'function';
  const baseClass = clsx(
    'flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm',
    interactive && 'cursor-pointer active:scale-[0.99] transition-transform',
    className
  );

  if (interactive) {
    return (
      <button type='button' onClick={onClick} aria-label={ariaLabel} className={baseClass}>
        <div className='flex flex-col'>
          <span className='text-base font-medium text-primary-text'>{primary}</span>
          {secondary && <span className='text-sm text-muted'>{secondary}</span>}
        </div>
        {trailing}
      </button>
    );
  }

  return (
    <div className={baseClass}>
      <div className='flex flex-col'>
        <span className='text-base font-medium text-primary-text'>{primary}</span>
        {secondary && <span className='text-sm text-muted'>{secondary}</span>}
      </div>
      {trailing}
    </div>
  );
}