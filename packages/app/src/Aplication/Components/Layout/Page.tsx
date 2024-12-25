/**
 * This component is used to create page structures. All "Pages" must be contained within this component.
 */

import clsx from 'clsx';
import { Title } from '../Molecules/Title';
import { Container } from './Container';

interface PageProps {
  children: React.ReactNode;
  title: string;
  size?: 'small' | 'full';
  headerRight?: React.ReactNode;
}

export const Page = ({
  children,
  title,
  size = 'full',
  headerRight,
}: PageProps) => {
  const classContainer = clsx('w-full flex flex-col gap-4 md:gap-6', {
    'max-w-[600px] mx-auto': size === 'small',
  });

  return (
    <div className="page p-4 grid grid-rows-[min-content_auto] grid-cols-1 gap-6 max-w-[100vw] bg-gray-50 md:p-6 md:pt-10">
      <Container row justify="between" align="center">
        <Title variant="h1">{title}</Title>
        {headerRight && <>{headerRight}</>}
      </Container>

      <section className={classContainer}>{children}</section>
    </div>
  );
};
