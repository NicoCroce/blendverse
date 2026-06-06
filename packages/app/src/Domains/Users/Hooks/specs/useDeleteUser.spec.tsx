import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../../Users.service';
import { useDeleteUser } from '../useDeleteUser';

const {
  useMutationMock,
  toastSuccessMock,
  toastErrorMock,
  toastInfoMock,
  invalidateMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastInfoMock: vi.fn(),
  invalidateMock: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
    info: toastInfoMock,
  },
}));

vi.mock('../../Users.service', () => ({
  UsersService: {
    delete: {
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
  Parameters<typeof UsersService.delete.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const Harness = () => {
  useDeleteUser();
  return null;
};

describe('useDeleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows info toast on mutate start', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.delete.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onMutate?.(1, mutationContext);

    expect(toastInfoMock).toHaveBeenCalledWith('Eliminando usuario');
  });

  it('shows success toast and invalidates cache on success', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.delete.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onSuccess?.(1, 1, undefined, mutationContext);

    expect(toastSuccessMock).toHaveBeenCalledWith('Usuario eliminado');
    expect(invalidateMock).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on failure', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.delete.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'error', data: undefined, shape: undefined },
      1,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith(
      'No se pudo eliminar el usuario',
    );
  });
});
