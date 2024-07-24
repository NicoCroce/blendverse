import React from 'react';

type TVariant = 'h1' | 'h2' | 'h3' | 'h4';

interface TitleProps {
  children: React.ReactNode;
  variant?: TVariant;
}

const headingTypes = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
};

const headingClasses = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
};

export const Title = ({ children, variant = 'h1' }: TitleProps) => {
  const HeadingTag = headingTypes[variant];
  const headingClass = headingClasses[variant];

  return React.createElement(HeadingTag, { className: headingClass }, children);
};
