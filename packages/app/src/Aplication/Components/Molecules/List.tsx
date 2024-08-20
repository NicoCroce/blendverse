import clsx from 'clsx';
import { createElement, ReactElement } from 'react';

interface ListProps {
  children: ReactElement<typeof ListLi>[];
  variant?: 'ordered' | 'unordered' | 'none';
  divided?: boolean;
}

interface ListLiProps {
  children: React.ReactNode;
}

const VARIANTS = {
  ordered: {
    style: 'list-decimal px-4',
    element: 'ol',
  },
  unordered: {
    style: 'list-disc px-4',
    element: 'ul',
  },
  none: {
    style: '',
    element: 'ul',
  },
} as const;

export const List = ({
  children,
  variant = 'none',
  divided = false,
}: ListProps) => {
  const { style, element } = VARIANTS[variant];
  const _style = clsx(style, {
    '[&>li]:border-b-2 [&>li:first-of-type]:border-t-2': divided,
  });

  return createElement(element, { className: _style }, children);
};

const ListLi = ({ children }: ListLiProps) => (
  <li className="py-1">{children}</li>
);

List.Li = ListLi;
