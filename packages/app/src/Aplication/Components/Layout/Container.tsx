import clsx from 'clsx';

type AlignValues = 'start' | 'end' | 'center' | 'strech';

const SPACE = {
  small: 'gap-2',
  medium: 'gap-4',
  large: 'gap-6',
  none: 'gap-0',
} as const;

interface ContainerProps {
  children: React.ReactNode;
  row?: boolean;
  className?: string;
  align?: AlignValues;
  justify?: AlignValues | 'between' | 'evenly' | 'around';
  space?: keyof typeof SPACE;
}

export const Container = ({
  children,
  className = '',
  row = false,
  align = 'strech',
  justify = 'start',
  space = 'medium',
}: ContainerProps) => {
  const _className = clsx(
    'flex',
    `items-${align} justify-${justify} ${SPACE[space]}`,
    className,
    {
      'flex-row': row,
      'flex-col': !row,
    },
  );
  return <div className={_className}>{children}</div>;
};
