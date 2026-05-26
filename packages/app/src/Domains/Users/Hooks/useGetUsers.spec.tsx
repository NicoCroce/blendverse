import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../Users.service';
import { useGetUsers } from './useGetUsers';

const { useQueryMock, useURLParamsMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useURLParamsMock: vi.fn(),
}));

vi.mock('@app/Aplication/Hooks/useURLParams', () => ({
  useURLParams: useURLParamsMock,
}));

vi.mock('../Users.service', () => ({
  UsersService: {
    getAll: {
      useQuery: useQueryMock,
    },
  },
}));

const Harness = () => {
  useGetUsers();
  return null;
};

describe('useGetUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: { data: [], total: 0 } });
    useURLParamsMock.mockReturnValue({ searchParams: { name: '' } });
  });

  it('calls useQuery with the searchParams from URL', () => {
    useURLParamsMock.mockReturnValue({ searchParams: { name: 'Alice' } });

    render(<Harness />);

    expect(UsersService.getAll.useQuery).toHaveBeenCalledWith(
      { name: 'Alice' },
      expect.any(Object),
    );
  });

  it('configures staleTime and refetch options', () => {
    render(<Harness />);

    expect(UsersService.getAll.useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        staleTime: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      }),
    );
  });
});
