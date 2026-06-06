import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogout } from '../../Hooks/useLogout';
import { LoginPage } from '../Login.page';

vi.mock('../../Hooks/useLogout', () => ({
  useLogout: vi.fn(),
}));

vi.mock('../../Components', () => ({
  AuthPageLayout: ({
    title,
    left,
    background,
    children,
  }: {
    title: string;
    left: React.ReactNode;
    background: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="auth-layout" data-background={background}>
      <h1>{title}</h1>
      <div>{left}</div>
      {children}
    </div>
  ),
  LeftContentPage: ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => <div>{title + ' - ' + subtitle}</div>,
  LoginForm: () => <div>login-form</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs out stale sessions on mount and renders the login layout', () => {
    render(<LoginPage />);

    expect(useLogout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('auth-layout')).toHaveAttribute(
      'data-background',
      '/images/login.png',
    );
    expect(screen.getByText('Iniciar sesión')).toBeDefined();
    expect(screen.getByText('MacroGest - Macrosistemas')).toBeDefined();
    expect(screen.getByText('login-form')).toBeDefined();
  });
});
