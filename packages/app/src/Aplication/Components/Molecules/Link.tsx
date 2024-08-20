import React from 'react';

interface LinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  target?: React.HTMLAttributeAnchorTarget | undefined;
}

export const Link = ({ target = '_blank', ...props }: LinkProps) => (
  <a
    target={target}
    className="inline-block text-blue-900 hover:underline px-1"
    {...props}
  />
);
