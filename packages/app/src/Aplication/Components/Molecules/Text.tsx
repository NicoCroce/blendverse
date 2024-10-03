import React from 'react';

interface TextProps {
  children: React.ReactNode;
  className?: string;
}

export const Text = ({ children, className = '' }: TextProps) => (
  <p className={`leading-7 ${className}`}>{children}</p>
);

const TextBlockquote = ({ children, className = '' }: TextProps) => (
  <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>
    {children}
  </blockquote>
);

const TextCode = ({ children, className = '' }: TextProps) => (
  <code
    className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${className}`}
  >
    {children}
  </code>
);

const TextLead = ({ children, className = '' }: TextProps) => (
  <p className={`text-xl text-muted-foreground ${className}`}>{children}</p>
);

const TextSmall = ({ children, className = '' }: TextProps) => (
  <small className={`text-sm font-medium leading-6 ${className}`}>
    {children}
  </small>
);

const TextMuted = ({ children, className = '' }: TextProps) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

Text.Blockquote = TextBlockquote;
Text.Code = TextCode;
Text.Lead = TextLead;
Text.Small = TextSmall;
Text.Muted = TextMuted;
