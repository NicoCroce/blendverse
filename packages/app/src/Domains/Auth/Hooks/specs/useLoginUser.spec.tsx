import { render } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type MutationFunctionContext,
} from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../Auth.service';
import { useLoginUser } from '../useLoginUser';

const {
  navigateMock,
  setLoggedMock,
  setQueryDataMock,
  toastErrorMock,
  useMutationMock,
  fetchEmpresasMock,
  fetchPermissionsMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setLoggedMock: vi.fn(),
  setQueryDataMock: vi.fn(),
  toastErrorMock: vi.fn(),
  useMutationMock: vi.fn(),
  fetchEmpresasMock: vi.fn().mockResolvedValue([]),
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

vi.mock('@app/Application/Helpers/isLogged', () => ({
  setLogged: setLoggedMock,
}));

vi.mock('@app/Application/Hooks/useGlobalStore', () => ({
  useGlobalStore: vi.fn(() => ({
    setQueryData: setQueryDataMock,
  })),
}));

vi.mock('../../Auth.service', () => ({
  AuthService: {
    login: {
      useMutation: useMutationMock,
    },
  },
}));

vi.mock('@app/Infrastructure/Services/clientApi', () => ({
  TrpcApi: {
    useUtils: vi.fn(() => ({
      empresasUsuarios: {
        getByUsuario: {
          fetch: fetchEmpresasMock,
        },
      },
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
  useLoginUser();
  return null;
};

type TLoginMutationOptions = NonNullable<
  Parameters<typeof AuthService.login.useMutation>[0]
>;

const loginVariables = {
  mail: 'john@example.com',
  password: 'password123',
};

const mutationContext: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

describe('useLoginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: unknown) => options);
    fetchEmpresasMock.mockResolvedValue([]);
    fetchPermissionsMock.mockResolvedValue([]);
  });

  it('stores the logged user and navigates to the main route on success', async () => {
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(AuthService.login.useMutation).mock
      .calls[0][0] as TLoginMutationOptions;
    const user = {
      id: 1,
      ownerId: 10,
      name: 'John',
      mail: 'john@example.com',
      rol: 'Full Admin',
      theme: 1,
    };

    await options.onSuccess?.(user, loginVariables, undefined, mutationContext);

    expect(setLoggedMock).toHaveBeenCalledTimes(1);
    expect(setQueryDataMock).toHaveBeenCalledWith(user);
    expect(navigateMock).toHaveBeenCalledWith('/documents');
  });

  it('navigates to the admin dashboard when the user has dashboard access', async () => {
    fetchPermissionsMock.mockResolvedValue(['dashboard-access']);
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(AuthService.login.useMutation).mock
      .calls[0][0] as TLoginMutationOptions;
    const user = {
      id: 1,
      ownerId: 10,
      name: 'John',
      mail: 'john@example.com',
      rol: 'Full Admin',
      theme: 1,
    };

    await options.onSuccess?.(user, loginVariables, undefined, mutationContext);

    expect(navigateMock).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('navigates to the empresa selection route when the user has multiple companies, even if admin', async () => {
    fetchEmpresasMock.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    fetchPermissionsMock.mockResolvedValue(['dashboard-access']);
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(AuthService.login.useMutation).mock
      .calls[0][0] as TLoginMutationOptions;
    const user = {
      id: 1,
      ownerId: 10,
      name: 'John',
      mail: 'john@example.com',
      rol: 'Full Admin',
      theme: 1,
    };

    await options.onSuccess?.(user, loginVariables, undefined, mutationContext);

    expect(navigateMock).toHaveBeenCalledWith('/seleccionar-empresa');
  });

  it('shows the login error without navigating', () => {
    render(<Harness />, { wrapper: createWrapper() });

    const options = vi.mocked(AuthService.login.useMutation).mock
      .calls[0][0] as TLoginMutationOptions;

    options.onError?.(
      new Error('Credenciales inválidas') as never,
      loginVariables,
      undefined,
      mutationContext,
    );

    expect(toastErrorMock).toHaveBeenCalledWith('Credenciales inválidas');
    expect(setLoggedMock).not.toHaveBeenCalled();
    expect(setQueryDataMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
