import * as React from 'react';

import { cn } from '@/Application/lib/utils';
import { useIsEditable } from '@/Application/Hooks/useIsEditable';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, ...props }, ref) => {
    const isEditable = useIsEditable();
    return (
      <textarea
        className={cn(
          'flex min-h-control-2x w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        disabled={disabled ?? !isEditable}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
