import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../Users.service';
import { useChangePassword } from './useChangePassword';

const { useMutationMock, toastSuccessMock, toastErrorMock, setQueryDataMock } =
  vi.hoisted(() => ({
    useMutationMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    setQueryDataMock: vi.fn(),
  }));

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('../Users.service', () => ({
  UsersService: {
    changePassword: {
      useMutation: useMutationMock,
    },
  },
}));

vi.mock('@app/Aplication', () => ({
  useGlobalStore: vi.fn(() => ({
    setQueryData: setQueryDataMock,
  })),
}));

type TMutationOptions = NonNullable<
  Parameters<typeof UsersService.changePassword.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const passwordInput = {
  password: 'old',
  newPassword: 'new',
  rePassword: 'new',
};

const Harness = () => {
  useChangePassword();
  return null;
};

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows success toast and updates user cache on success', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.changePassword.useMutation).mock
      .calls[0][0] as TMutationOptions;

    // El primer y tercer parámetro son de tipo never, pasar un valor dummy
    options.onSuccess?.(
      undefined as never,
      passwordInput,
      undefined as never,
      mutationContext,
    );

    expect(toastSuccessMock).toHaveBeenCalledWith('Contraseña actualizada');
    expect(setQueryDataMock).toHaveBeenCalledTimes(1);
  });

  it('sets renewPassword to false in the cache after success', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.changePassword.useMutation).mock
      .calls[0][0] as TMutationOptions;

    // El primer y tercer parámetro son de tipo never, pasar un valor dummy
    options.onSuccess?.(
      undefined as never,
      passwordInput,
      undefined as never,
      mutationContext,
    );

    const updater = setQueryDataMock.mock.calls[0][0];
    const prev = { id: 1, mail: 'u@t.com', name: 'U', renewPassword: true };
    const updated = updater(prev);
    expect(updated.renewPassword).toBe(false);
  });

  it('shows error toast on failure', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.changePassword.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'Contraseña incorrecta', data: undefined, shape: undefined },
      passwordInput,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith('Contraseña incorrecta');
  });
});
