import * as React from 'react';

import { cn } from '@/Aplication/lib/utils';
import { useIsEditable } from '@/Aplication/Hooks/useIsEditable';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  forceEnabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, forceEnabled = false, ...props }, ref) => {
    const isEditable = useIsEditable();
    return (
      <input
        type={type}
        autoComplete="off"
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        disabled={forceEnabled ? false : (disabled ?? !isEditable)}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
