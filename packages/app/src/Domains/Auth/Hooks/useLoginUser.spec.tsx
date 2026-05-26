import { render } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type MutationFunctionContext,
} from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAIN_ROUTE } from '@app/Domains/Main';
import { AuthService } from '../Auth.service';
import { useLoginUser } from './useLoginUser';

const {
  navigateMock,
  setLoggedMock,
  setQueryDataMock,
  toastErrorMock,
  useMutationMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setLoggedMock: vi.fn(),
  setQueryDataMock: vi.fn(),
  toastErrorMock: vi.fn(),
  useMutationMock: vi.fn(),
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

vi.mock('@app/Aplication/Helpers/isLogged', () => ({
  setLogged: setLoggedMock,
}));

vi.mock('@app/Aplication/Hooks/useGlobalStore', () => ({
  useGlobalStore: vi.fn(() => ({
    setQueryData: setQueryDataMock,
  })),
}));

vi.mock('../Auth.service', () => ({
  AuthService: {
    login: {
      useMutation: useMutationMock,
    },
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
  });

  it('stores the logged user and navigates to the main route on success', () => {
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

    options.onSuccess?.(user, loginVariables, undefined, mutationContext);

    expect(setLoggedMock).toHaveBeenCalledTimes(1);
    expect(setQueryDataMock).toHaveBeenCalledWith(user);
    expect(navigateMock).toHaveBeenCalledWith(MAIN_ROUTE);
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
