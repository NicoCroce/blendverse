import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DisclaimerForm } from '../DisclaimerForm';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock('@app/Application', () => {
  const Button = ({
    children,
    disabled,
    isLoading,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
  }) => (
    <button {...props} disabled={disabled || isLoading}>
      {children}
    </button>
  );
  const InputPassword = forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement>
  >((props, ref) => <input {...props} ref={ref} />);
  InputPassword.displayName = 'InputPassword';
  const Input = { Password: InputPassword };
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const AlertMessage = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div role="alert">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );

  return { AlertMessage, Button, Container, Input };
});

vi.mock('../Hooks/useDisclaimer', () => ({
  useSignDisclaimer: () => ({
    mutate,
    isPending: false,
    isSuccess: false,
    error: null,
  }),
}));

describe('DisclaimerForm', () => {
  it('submits the password with the displayed terms version', async () => {
    render(<DisclaimerForm termsVersion={7} />);

    fireEvent.change(
      screen.getByPlaceholderText('Ingrese su contraseña para firmar'),
      {
        target: { value: 'secret' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar términos' }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        password: 'secret',
        termsVersion: 7,
      });
    });
  });

  it('does not allow acceptance when the terms version is unavailable', () => {
    render(<DisclaimerForm termsVersion={null} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Términos no disponibles',
    );
    expect(
      screen.getByRole('button', { name: 'Aceptar términos' }),
    ).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });
});
