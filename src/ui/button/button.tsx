import * as React from 'react';
import { tv, VariantProps } from 'tailwind-variants';

import { ButtonIcon } from './button-icon';

const button = tv({
  base: 'inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold focus:outline-none active:scale-[0.98] transition gap-2',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-text shadow-sm',
      secondary: 'bg-white text-gray-800 border border-gray-300 shadow-sm',
      ghost: 'bg-transparent text-gray-800',
      danger: 'bg-red-600 text-white shadow-sm',
    },
    size: {
      md: 'min-h-[48px] py-3 px-5 text-base',
      sm: 'min-h-[44px] py-2 px-4 text-sm',
      icon: 'min-h-[48px] min-w-[48px] p-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { type = 'button', className = '', variant, size, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={button({ ...(variant && { variant }), ...(size && { size }), className })}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);

ButtonRoot.displayName = 'Button';

export const Button = {
  Root: ButtonRoot,
  Icon: ButtonIcon,
};
