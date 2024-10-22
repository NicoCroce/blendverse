/**
 * This component is used to create page structures. All "Pages" must be contained within this component.
 */

import { Title } from '../Molecules/Title';
import { Container } from './Container';
import React from 'react';

interface PageProps {
  children: React.ReactNode;
  left?: React.ReactNode;
  title: string;
}

export const HalfPage = ({ children, left, title }: PageProps) => (
  <Container className="h-full bg-white md:flex-row" space="none">
    <Container className="flex-[0_0_10%]  md:flex-auto md:basis-1/2 h-full bg-primary">
      {left}
    </Container>
    <Container className="flex-auto md:basis-1/2 p-6 pt-10 rounded-t-2xl -top-5 md:top-0 md:p-32 md:rounded-l-2xl relative md:-left-5 bg-white">
      <Title variant="h1">{title}</Title>
      <Container className="md:max-w-[500px] md:min-w-[430px]">
        {children}
      </Container>
    </Container>
  </Container>
);
