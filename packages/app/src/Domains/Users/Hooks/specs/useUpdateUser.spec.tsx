import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../../Users.service';
import { useUpdateUser } from '../useUpdateUser';

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
    update: {
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
  Parameters<typeof UsersService.update.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const updateInput = {
  id: 1,
  name: 'Updated',
  mail: 'u@t.com',
  role: null,
  profile: null,
};

const Harness = () => {
  useUpdateUser();
  return null;
};

describe('useUpdateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
  });

  it('shows info toast on mutate start', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.update.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onMutate?.(updateInput, mutationContext);

    expect(toastInfoMock).toHaveBeenCalledWith('Actualizando usuario');
  });

  it('shows success toast and invalidates cache on success', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.update.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onSuccess?.(1, updateInput, undefined, mutationContext);

    expect(toastSuccessMock).toHaveBeenCalledWith('Usuario actualizado');
    expect(invalidateMock).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on failure', () => {
    render(<Harness />);

    const options = vi.mocked(UsersService.update.useMutation).mock
      .calls[0][0] as TMutationOptions;

    options.onError?.(
      { message: 'error', data: undefined, shape: undefined },
      updateInput,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith(
      'No se pudo actualizar el usuario',
    );
  });
});
