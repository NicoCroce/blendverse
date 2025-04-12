/**
 * This component is used to create page structures. All "Pages" must be contained within this component.
 */

import clsx from 'clsx';
import { Title } from '../Molecules/Title';
import { Container } from './Container';
import { useDevice, useGlobalStore } from '@app/Aplication/Hooks';
import { useEffect } from 'react';

interface PageProps {
  children: React.ReactNode;
  title: string;
  size?: 'small' | 'full';
  headerRight?: React.ReactNode;
  backButton?: boolean;
}

export const Page = ({
  children,
  title,
  size = 'full',
  headerRight,
  backButton = false,
}: PageProps) => {
  const { isMobile } = useDevice();

  const small =
    size === 'small' ? 'max-w-[600px]' : 'md:max-w-[900px] lg:max-w-[1400px]';

  const classContainer = clsx(
    'w-full flex flex-col gap-4 md:gap-6 mx-auto',
    small,
  );
  const { setQueryData } = useGlobalStore('backButtonEnabled');

  useEffect(() => {
    setQueryData(backButton);
  }, [backButton, setQueryData]);

  return (
    <div className="page p-4 grid grid-rows-[min-content_auto] grid-cols-1 gap-6 max-w-[100vw] h-full bg-gray-50 md:p-6 md:pt-10">
      <Container
        row={isMobile ? false : true}
        justify="between"
        align={isMobile ? 'start' : 'center'}
        className={clsx('lg:pb-6 mx-auto w-full', small)}
      >
        <Title variant="h1">{title}</Title>
        {headerRight && (
          <Container className="self-end">{headerRight}</Container>
        )}
      </Container>

      <section className={classContainer}>{children}</section>
    </div>
  );
};
