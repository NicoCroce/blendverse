import clsx from 'clsx';

type AlignValues = 'start' | 'end' | 'center' | 'strech';

const SPACE = {
  small: 'gap-2',
  medium: 'gap-4',
  large: 'gap-6',
  none: 'gap-0',
} as const;

interface ContainerProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  children: React.ReactNode;
  row?: boolean;
  className?: string;
  align?: AlignValues;
  justify?: AlignValues | 'between' | 'evenly' | 'around';
  space?: keyof typeof SPACE;
  block?: boolean;
}

export const Container = ({
  children,
  className = '',
  row = false,
  align = 'strech',
  justify = 'start',
  space = 'medium',
  block = false,
  ...props
}: ContainerProps) => {
  const _classNameBlock = clsx('block', className);

  const _classNameFlex = clsx(
    'flex',
    `items-${align} justify-${justify} ${SPACE[space]}`,
    className,
    {
      'flex-row': row,
      'flex-col': !row,
    },
  );

  return (
    <div className={block ? _classNameBlock : _classNameFlex} {...props}>
      {children}
    </div>
  );
};
