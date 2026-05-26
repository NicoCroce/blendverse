import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetUser } from './useGetUser';
import { UsersService } from '../Users.service';

const { useQueryMock, useURLParamsMock, getCacheDataMock, refetchMock } =
  vi.hoisted(() => ({
    useQueryMock: vi.fn(),
    useURLParamsMock: vi.fn(),
    getCacheDataMock: vi.fn(),
    refetchMock: vi.fn(),
  }));

vi.mock('@app/Aplication/Hooks/useURLParams', () => ({
  useURLParams: useURLParamsMock,
}));

vi.mock('../Users.service', () => ({
  UsersService: {
    get: {
      useQuery: useQueryMock,
    },
  },
}));

vi.mock('./useCacheUsers', () => ({
  useCacheUsers: () => ({
    getData: getCacheDataMock,
    invalidate: vi.fn(),
  }),
}));

const mockUser = { id: 1, name: 'Alice', mail: 'alice@test.com' };

const Harness = ({ id }: { id?: number }) => {
  useGetUser(id);
  return null;
};

describe('useGetUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useURLParamsMock.mockReturnValue({ searchParams: { name: '' } });
    refetchMock.mockResolvedValue({ data: mockUser });
    useQueryMock.mockReturnValue({
      isFetched: false,
      isFetching: false,
      refetch: refetchMock,
    });
    getCacheDataMock.mockReturnValue(null);
  });

  it('calls useQuery with id=0 when id is undefined', () => {
    render(<Harness />);

    expect(UsersService.get.useQuery).toHaveBeenCalledWith(0, {
      enabled: false,
    });
  });

  it('calls useQuery with the given id', () => {
    render(<Harness id={5} />);

    expect(UsersService.get.useQuery).toHaveBeenCalledWith(5, {
      enabled: false,
    });
  });

  it('calls refetch when user is not cached and not yet fetched', async () => {
    getCacheDataMock.mockReturnValue(null);

    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it('does NOT call refetch when user is found in cache', async () => {
    getCacheDataMock.mockReturnValue({ data: [mockUser] });

    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).not.toHaveBeenCalled();
    });
  });

  it('does NOT call refetch when isFetching is true', async () => {
    getCacheDataMock.mockReturnValue(null);
    useQueryMock.mockReturnValue({
      isFetched: false,
      isFetching: true,
      refetch: refetchMock,
    });

    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).not.toHaveBeenCalled();
    });
  });

  it('does NOT call refetch when isFetched is already true', async () => {
    getCacheDataMock.mockReturnValue(null);
    useQueryMock.mockReturnValue({
      isFetched: true,
      isFetching: false,
      refetch: refetchMock,
    });

    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).not.toHaveBeenCalled();
    });
  });
});
