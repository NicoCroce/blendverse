import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '@app/Domains/Users';
import { useRegisterUser } from '../useRegisterUser';

const { useMutationMock, toastSuccessMock, toastErrorMock } = vi.hoisted(
  () => ({
    useMutationMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
  }),
);

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('@app/Domains/Users', () => ({
  UsersService: {
    create: {
      useMutation: useMutationMock,
    },
  },
}));

type TMutationOptions = NonNullable<
  Parameters<typeof UsersService.create.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const registerInput = {
  name: 'New User',
  mail: 'new@test.com',
  password: 'pass',
  rePassword: 'pass',
  role: null,
  profile: null,
};

describe('useRegisterUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows success toast on successful registration', () => {
    render(
      <>
        {(() => {
          useRegisterUser();
          return null;
        })()}
      </>,
    );

    const options = vi.mocked(UsersService.create.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onSuccess?.(
      { id: 1, mail: 'new@test.com', name: 'New User' } as never,
      registerInput,
      undefined,
      mutationContext,
    );

    expect(toastSuccessMock).toHaveBeenCalledWith(
      expect.stringContaining('Inicie sesión'),
    );
  });

  it('calls onSuccess callback when provided', () => {
    const onSuccessCallback = vi.fn();
    const HarnessWithCallback = () => {
      useRegisterUser(onSuccessCallback);
      return null;
    };

    render(<HarnessWithCallback />);

    const options = vi.mocked(UsersService.create.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onSuccess?.(
      { id: 1 } as never,
      registerInput,
      undefined,
      mutationContext,
    );

    expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on registration failure', () => {
    render(
      <>
        {(() => {
          useRegisterUser();
          return null;
        })()}
      </>,
    );

    const options = vi.mocked(UsersService.create.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'El usuario ya existe', data: undefined, shape: undefined },
      registerInput,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith('El usuario ya existe');
  });
});
