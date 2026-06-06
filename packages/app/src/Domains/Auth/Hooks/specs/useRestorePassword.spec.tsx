import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../Auth.service';
import { useRestorePassword } from '../useRestorePassword';

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
    restorePassword: {
      useMutation: useMutationMock,
    },
  },
}));

type TMutationOptions = NonNullable<
  Parameters<typeof AuthService.restorePassword.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const Harness = () => {
  useRestorePassword();
  return null;
};

describe('useRestorePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows success toast with mail and navigates to auth on success', () => {
    render(<Harness />, { wrapper: MemoryRouter });

    const options = vi.mocked(AuthService.restorePassword.useMutation).mock
      .calls[0][0] as TMutationOptions;

    // El primer y tercer parámetro son de tipo never, pasar un valor dummy
    options.onSuccess?.(
      undefined as never,
      'user@test.com',
      undefined as never,
      mutationContext,
    );

    expect(toastSuccessMock).toHaveBeenCalledWith(
      expect.stringContaining('user@test.com'),
    );
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on failure', () => {
    render(<Harness />, { wrapper: MemoryRouter });

    const options = vi.mocked(AuthService.restorePassword.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'User not found', data: undefined, shape: undefined },
      'user@test.com',
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith('User not found');
  });
});
