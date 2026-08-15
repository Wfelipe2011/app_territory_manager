import * as React from 'react';
import { tv, VariantProps } from 'tailwind-variants';

import { ButtonIcon } from './button-icon';

const button = tv({
  base: 'flex items-center disabled:opacity-70 disabled:cursor-not-allowed rounded-md shadow-sm font-medium focus:outline-none hover:opacity-80 gap-2 shadow-xl rounded-xl',
  variants: {
    variant: {
      primary: 'bg-primary text-gray-700',
      ghost: 'bg-transparent text-gray-700',
    },
    size: {
      md: 'py-2 px-6 text-md',
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
