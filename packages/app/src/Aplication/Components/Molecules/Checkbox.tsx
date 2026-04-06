import { Container } from '..';
import { Checkbox as CheckboxLib } from '../ui/checkbox';
import { Text } from '.';
import * as React from 'react';

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxLib> {
  label: string;
  value: string;
}

export const Checkbox = ({ label, value, ...props }: CheckboxProps) => {
  return (
    <Container row align="start" space="small">
      <CheckboxLib value={value} {...props} />
      <Text.Label>{label}</Text.Label>
    </Container>
  );
};
