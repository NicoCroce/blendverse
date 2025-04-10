import React from 'react';

type TVariant = 'h1' | 'h2' | 'h3' | 'h4';

interface TitleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  > {
  children: React.ReactNode;
  variant?: TVariant;
  className?: string;
}

const headingClasses = {
  h1: 'scroll-m-20 text-4xl leading-[46px] py-2 pt-6 tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl tracking-tight',
  h4: 'scroll-m-20 text-xl tracking-tight',
};

export const Title = ({
  children,
  variant = 'h1',
  className = '',
  ...props
}: TitleProps) => {
  const headingClass = `${headingClasses[variant]} ${className}`;

  return React.createElement(
    variant,
    { className: headingClass, ...props },
    children,
  );
};
