import clsx from 'clsx';

type AlignValues = 'start' | 'end' | 'center' | 'strech' | 'baseline';

const ALIGN = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  strech: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const JUSTIFY = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  strech: 'justify-stretch',
  baseline: 'justify-baseline',
  between: 'justify-between',
  evenly: 'justify-evenly',
  around: 'justify-around',
} as const;

const SPACE = {
  small: 'gap-2',
  medium: 'gap-4',
  large: 'gap-6',
  none: 'gap-0',
} as const;

interface ContainerProps extends React.DetailedHTMLProps<
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
    ALIGN[align],
    JUSTIFY[justify],
    SPACE[space],
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
