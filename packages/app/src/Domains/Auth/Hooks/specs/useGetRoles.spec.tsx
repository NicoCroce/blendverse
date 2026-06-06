import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsService } from '../../Auth.service';
import { useGetRoles } from '../useGetRoles';

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock('../../Auth.service', () => ({
  PermissionsService: {
    getRoles: {
      useQuery: useQueryMock,
    },
  },
}));

const Harness = () => {
  useGetRoles();
  return null;
};

describe('useGetRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: [] });
  });

  it('calls useQuery with staleTime and gcTime', () => {
    render(<Harness />);

    expect(PermissionsService.getRoles.useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        staleTime: 60000,
        gcTime: 60000,
      }),
    );
  });

  it('configures refetch on window focus and reconnect', () => {
    render(<Harness />);

    expect(PermissionsService.getRoles.useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      }),
    );
  });
});
