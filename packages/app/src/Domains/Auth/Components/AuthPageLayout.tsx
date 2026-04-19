import { ReactNode } from 'react';
import { HalfPage, Title } from '@app/Aplication';

interface AuthPageLayoutProps {
  title: string;
  subtitle?: string;
  background?: string;
  left?: ReactNode;
  children: ReactNode;
}

export const AuthPageLayout = ({
  title,
  subtitle,
  background,
  left,
  children,
}: AuthPageLayoutProps) => {
  return (
    <HalfPage title={title} background={background} left={left}>
      {subtitle && <Title variant="h3">{subtitle}</Title>}
      {children}
    </HalfPage>
  );
};
