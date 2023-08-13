import clsx from 'clsx';
import Link from 'next/link';
import * as React from 'react';

import { Spinner } from '@/ui';

const variants = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-gray-700',
  inverse: 'bg-white text-primary',
  danger: 'bg-red-600 text-white',
};

const sizes = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-2 px-6 text-md',
  lg: 'py-3 px-8 text-lg',
};

const positionsX = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
};

type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined };

export type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  positionX?: 'start' | 'end' | 'center';
  disabled?: boolean;
} & IconProps;

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      to,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      positionX = 'center',
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <Link
        href={to}
        ref={ref}
        className={clsx(
          'flex items-center rounded-md font-medium shadow-sm transition-all duration-200 ease-in-out hover:brightness-110 focus:outline-none',
          variants[variant],
          sizes[size],
          positionsX[positionX],
          disabled && 'cursor-not-allowed opacity-70',
          className
        )}
        {...props}
      >
        {isLoading && <Spinner size='sm' className='text-current' />}
        {!isLoading && startIcon}
        <span className='mx-2'>{props.children}</span> {!isLoading && endIcon}
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default LinkButton;
