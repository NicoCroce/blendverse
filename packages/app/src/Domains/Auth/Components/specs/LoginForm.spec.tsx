import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginUser } from '../../Hooks';
import { useRegisterUser } from '../../Hooks/useRegisterUser';
import { LoginForm } from '../LoginForm';

const loginMutationMock = vi.fn();
const registerMutationMock = vi.fn();

vi.mock('../../Hooks', () => ({
  useLoginUser: vi.fn(),
}));

vi.mock('../../Hooks/useRegisterUser', () => ({
  useRegisterUser: vi.fn(),
}));

const renderLoginForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(useLoginUser).mockReturnValue({
      mutate: loginMutationMock,
      isPending: false,
    } as never);
    vi.mocked(useRegisterUser).mockReturnValue({
      mutate: registerMutationMock,
      isPending: false,
    } as never);
  });

  it('renders login fields, submit action and restore password link', () => {
    renderLoginForm();

    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Constraseña')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeDefined();
    expect(
      screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' }),
    ).toHaveAttribute('href', '/reset-password');
  });

  it('shows validation errors for empty email, invalid email and short password', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(screen.getByText('Enter an email')).toBeDefined();
    expect(
      screen.getByText('La contraseña debe ser mayor a 8 caracteres'),
    ).toBeDefined();

    await user.type(screen.getByLabelText('Email'), 'correo-invalido');
    await user.type(screen.getByLabelText('Constraseña'), '1234567');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(screen.getByText('Enter a correct format email')).toBeDefined();
    expect(
      screen.getByText('La contraseña debe ser mayor a 8 caracteres'),
    ).toBeDefined();
    expect(loginMutationMock).not.toHaveBeenCalled();
  });

  it('submits login credentials through the login mutation', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Constraseña'), '12345678');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(loginMutationMock).toHaveBeenCalledTimes(1);
    expect(loginMutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mail: 'john@example.com',
        password: '12345678',
      }),
    );
  });

  it('disables submit while the login mutation is pending', () => {
    vi.mocked(useLoginUser).mockReturnValue({
      mutate: loginMutationMock,
      isPending: true,
    } as never);

    renderLoginForm();

    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeDisabled();
  });
});
