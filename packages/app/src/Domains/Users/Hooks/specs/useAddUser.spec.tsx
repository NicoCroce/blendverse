import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../../Users.service';
import { useAddUser } from '../useAddUser';

const { useMutationMock, toastSuccessMock, toastErrorMock, invalidateMock } =
  vi.hoisted(() => ({
    useMutationMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    invalidateMock: vi.fn(),
  }));

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('../../Users.service', () => ({
  UsersService: {
    create: {
      useMutation: useMutationMock,
    },
    getAll: {
      useQuery: vi.fn().mockReturnValue({ data: null }),
    },
  },
}));

vi.mock('../useCacheUsers', () => ({
  useCacheUsers: () => ({
    invalidate: invalidateMock,
    getData: vi.fn(),
  }),
}));

type TMutationOptions = NonNullable<
  Parameters<typeof UsersService.create.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const userInput = {
  name: 'New',
  mail: 'new@test.com',
  password: 'pass',
  rePassword: 'pass',
  role: null,
  profile: null,
};

const Harness = () => {
  useAddUser();
  return null;
};

describe('useAddUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows success toast and invalidates cache on success', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.create.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onSuccess?.(
      { id: 1 } as never,
      userInput,
      undefined,
      mutationContext,
    );

    expect(toastSuccessMock).toHaveBeenCalledWith('Usuario agregado');
    expect(invalidateMock).toHaveBeenCalledTimes(1);
  });

  it('shows error toast with error message on failure', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.create.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'usuario duplicado', data: undefined, shape: undefined },
      userInput,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('usuario duplicado'),
    );
  });
});
