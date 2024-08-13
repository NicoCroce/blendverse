/**
 * This component is used to create page structures. All "Pages" must be contained within this component.
 */

import clsx from 'clsx';
import { Title } from '../Molecules/Title';

interface PageProps {
  children: React.ReactNode;
  title: string;
  size?: 'small' | 'full';
}

export const Page = ({ children, title, size = 'full' }: PageProps) => {
  const classContainer = clsx('w-full flex flex-col gap-4 md:gap-6', {
    'max-w-[600px] mx-auto': size === 'small',
  });

  return (
    <div className="page h-[100%] p-4 grid grid-rows-[48px_auto] grid-cols-1 gap-6 max-w-[100vw] bg-gray-50 md:p-6 md:pt-10">
      <Title variant="h1">{title}</Title>
      <section className={classContainer}>{children}</section>
    </div>
  );
};
