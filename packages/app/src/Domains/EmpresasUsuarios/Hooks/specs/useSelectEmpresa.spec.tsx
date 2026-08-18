import { render } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type MutationFunctionContext,
} from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmpresasUsuariosService } from '../../EmpresasUsuarios.service';
import { useSelectEmpresa } from '../useSelectEmpresa';

const {
  navigateMock,
  setQueryDataMock,
  toastErrorMock,
  useMutationMock,
  fetchPermissionsMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setQueryDataMock: vi.fn(),
  toastErrorMock: vi.fn(),
  useMutationMock: vi.fn(),
  fetchPermissionsMock: vi.fn().mockResolvedValue([]),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: toastErrorMock,
  },
}));

vi.mock('@app/Application', () => ({
  useGlobalStore: vi.fn(() => ({
    setQueryData: setQueryDataMock,
  })),
}));

vi.mock('../../EmpresasUsuarios.service', () => ({
  EmpresasUsuariosService: {
    selectEmpresa: {
      useMutation: useMutationMock,
    },
  },
}));

vi.mock('@app/Infrastructure/Services/clientApi', () => ({
  TrpcApi: {
    useUtils: vi.fn(() => ({
      permissions: {
        getPermissionByUser: {
          fetch: fetchPermissionsMock,
        },
      },
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  });
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
  return TestWrapper;
};

const Harness = () => {
  useSelectEmpresa();
  return null;
};

type TSelectEmpresaMutationOptions = NonNullable<
  Parameters<typeof EmpresasUsuariosService.selectEmpresa.useMutation>[0]
>;

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

describe('useSelectEmpresa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
    fetchPermissionsMock.mockResolvedValue([]);
  });

  it('navigates to the documents route when the user has no dashboard access', async () => {
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(EmpresasUsuariosService.selectEmpresa.useMutation)
      .mock.calls[0][0] as TSelectEmpresaMutationOptions;

    await options.onSuccess?.(
      { ownerId: 5 },
      { empresaId: 5 },
      undefined,
      mutationContext,
    );

    expect(setQueryDataMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/documents');
  });

  it('navigates to the admin dashboard when the user has dashboard access', async () => {
    fetchPermissionsMock.mockResolvedValue(['dashboard-access']);
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(EmpresasUsuariosService.selectEmpresa.useMutation)
      .mock.calls[0][0] as TSelectEmpresaMutationOptions;

    await options.onSuccess?.(
      { ownerId: 5 },
      { empresaId: 5 },
      undefined,
      mutationContext,
    );

    expect(navigateMock).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('shows the error toast without navigating on failure', () => {
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(EmpresasUsuariosService.selectEmpresa.useMutation)
      .mock.calls[0][0] as TSelectEmpresaMutationOptions;

    options.onError?.(
      { message: 'No tenés acceso a esta empresa' } as never,
      { empresaId: 5 },
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith(
      'No tenés acceso a esta empresa',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
