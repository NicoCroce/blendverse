import { render } from '@testing-library/react';
import {
  type MutationFunctionContext,
  QueryClient,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OwnserSysService } from '../Config.service';
import { useUpdateTheme } from './useUpdateTheme';

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

vi.mock('../Config.service', () => ({
  OwnserSysService: {
    changeTheme: {
      useMutation: useMutationMock,
    },
  },
}));

type TUpdateThemeMutationOptions = NonNullable<
  Parameters<typeof OwnserSysService.changeTheme.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const Harness = () => {
  useUpdateTheme();
  return null;
};

describe('useUpdateTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('shows success toast on successful theme change', () => {
    useMutationMock.mockImplementation((options: unknown) => ({
      mutate: vi.fn(),
      isPending: false,
      ...(options as object),
    }));

    render(<Harness />);

    const options = vi.mocked(OwnserSysService.changeTheme.useMutation).mock
      .calls[0][0] as TUpdateThemeMutationOptions;

    options.onSuccess?.(1, 1, undefined, mutationContext);

    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Tema actualizado correctamente',
    );
  });

  it('shows error toast when theme change fails', () => {
    useMutationMock.mockImplementation((options: unknown) => ({
      mutate: vi.fn(),
      isPending: false,
      ...(options as object),
    }));

    render(<Harness />);

    const options = vi.mocked(OwnserSysService.changeTheme.useMutation).mock
      .calls[0][0] as TUpdateThemeMutationOptions;

    options.onError?.(
      { message: 'error', data: undefined, shape: undefined },
      1,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith('Error al actualizar el tema');
  });
});
