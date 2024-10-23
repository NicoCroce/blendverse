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
  background?: string;
}

export const HalfPage = ({ children, left, title, background }: PageProps) => {
  const inlineStyles = background
    ? { backgroundImage: `url(${background})` }
    : {};

  return (
    <Container className="h-full bg-white md:flex-row" space="none">
      <Container
        block
        className={`flex-[0_0_10%]  md:flex-auto md:basis-1/2 h-full bg-primary`}
      >
        <div
          className="h-1/2 md:h-full absolute top-0 left-0 right-0 md:right-1/2 bottom-0 brightness-50 opacity-80 saturate-50 hue-rotate-[176deg]"
          style={inlineStyles}
        ></div>
        <div className="relative z-10 realative">{left}</div>
      </Container>
      <Container
        align="center"
        className="flex-auto md:basis-1/2 p-6 pt-10 rounded-t-2xl -top-5 md:top-0 md:p-32 md:rounded-l-2xl relative md:-left-5 bg-white z-50"
      >
        <Container className="w-full max-w-[500px]">
          <Title variant="h1">{title}</Title>
          <Container block>{children}</Container>
        </Container>
      </Container>
    </Container>
  );
};
