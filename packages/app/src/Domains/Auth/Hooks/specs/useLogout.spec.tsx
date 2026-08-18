import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../Auth.service';
import { useLogout } from '../useLogout';

const {
  mutateMock,
  useMutationMock,
  isLoggedMock,
  removeClientMock,
  removeQueriesMock,
  clearQueryCacheMock,
  clearMutationCacheMock,
  reloadMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  useMutationMock: vi.fn(),
  isLoggedMock: vi.fn(),
  removeClientMock: vi.fn(),
  removeQueriesMock: vi.fn(),
  clearQueryCacheMock: vi.fn(),
  clearMutationCacheMock: vi.fn(),
  reloadMock: vi.fn(),
}));

vi.mock('@app/Application/Helpers/isLogged', () => ({
  isLogged: isLoggedMock,
}));

vi.mock('@app/Application/Helpers/Indexdb', () => ({
  createIDBPersister: () => ({
    removeClient: removeClientMock,
  }),
}));

vi.mock('@app/queryClient', () => ({
  queryClient: {
    removeQueries: removeQueriesMock,
    getQueryCache: () => ({
      clear: clearQueryCacheMock,
    }),
    getMutationCache: () => ({
      clear: clearMutationCacheMock,
    }),
  },
}));

vi.mock('../../Auth.service', () => ({
  AuthService: {
    logout: {
      useMutation: useMutationMock,
    },
  },
}));

const Harness = () => {
  useLogout();
  return null;
};

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockReturnValue({ mutate: mutateMock });
    vi.stubGlobal('location', { reload: reloadMock });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not trigger logout when the user is already logged out', () => {
    isLoggedMock.mockReturnValue(false);

    render(<Harness />);

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('triggers logout when a previous session is detected', async () => {
    isLoggedMock.mockReturnValue(true);

    render(<Harness />);

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });
  });

  it('clears persisted client state after a successful logout', async () => {
    localStorage.setItem('logged', 'true');
    isLoggedMock.mockReturnValue(true);

    render(<Harness />);

    const options = vi.mocked(AuthService.logout.useMutation).mock
      .calls[0][0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(localStorage.getItem('logged')).toBeNull();
    expect(removeQueriesMock).toHaveBeenCalledTimes(1);
    expect(clearQueryCacheMock).toHaveBeenCalledTimes(1);
    expect(clearMutationCacheMock).toHaveBeenCalledTimes(1);
    expect(removeClientMock).toHaveBeenCalledTimes(1);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
