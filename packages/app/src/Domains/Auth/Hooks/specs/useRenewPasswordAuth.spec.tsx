import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../Auth.service';
import { useRenewPasswordAuth } from '../useRenewPasswordAuth';

const { navigateMock, useMutationMock, toastSuccessMock, toastErrorMock } =
  vi.hoisted(() => ({
    navigateMock: vi.fn(),
    useMutationMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
  }));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('../../Auth.service', () => ({
  AuthService: {
    renewPasswordAuth: {
      useMutation: useMutationMock,
    },
  },
}));

type TMutationOptions = NonNullable<
  Parameters<typeof AuthService.renewPasswordAuth.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const Harness = () => {
  useRenewPasswordAuth();
  return null;
};

describe('useRenewPasswordAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows success toast and navigates to auth route on success', () => {
    render(<Harness />, { wrapper: MemoryRouter });

    const options = vi.mocked(AuthService.renewPasswordAuth.useMutation).mock
      .calls[0][0] as TMutationOptions;

    // El primer y tercer parámetro son de tipo never, pasar un valor dummy
    options.onSuccess?.(
      undefined as never,
      { token: '', newPassword: 'new', rePassword: 'new' },
      undefined as never,
      mutationContext,
    );

    expect(toastSuccessMock).toHaveBeenCalledWith(
      expect.stringContaining('nueva contraseña'),
    );
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on failure', () => {
    render(<Harness />, { wrapper: MemoryRouter });

    const options = vi.mocked(AuthService.renewPasswordAuth.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'Token invalid', data: undefined, shape: undefined },
      { token: '', newPassword: 'new', rePassword: 'new' },
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith('Token invalid');
  });
});
