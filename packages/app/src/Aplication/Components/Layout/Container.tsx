import clsx from 'clsx';

type AlignValues = 'start' | 'end' | 'center' | 'strech';

interface ContainerProps {
  children: React.ReactNode;
  row?: boolean;
  className?: string;
  align?: AlignValues;
  justify?: AlignValues | 'between' | 'evenly' | 'around';
}

export const Container = ({
  children,
  className = '',
  row = false,
  align = 'strech',
  justify = 'start',
}: ContainerProps) => {
  const _className = clsx(
    'flex gap-4',
    `items-${align} justify-${justify}`,
    className,
    {
      'flex-row': row,
      'flex-col': !row,
    },
  );
  return <div className={_className}>{children}</div>;
};
