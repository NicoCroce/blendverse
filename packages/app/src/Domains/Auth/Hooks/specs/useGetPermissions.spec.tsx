import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsService } from '../../Auth.service';
import { useGetPermissions } from '../useGetPermissions';

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock('../../Auth.service', () => ({
  PermissionsService: {
    getPermissionByUser: {
      useQuery: useQueryMock,
    },
  },
}));

const Harness = () => {
  useGetPermissions();
  return null;
};

describe('useGetPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: [] });
  });

  it('calls useQuery with staleTime and gcTime', () => {
    render(<Harness />);

    expect(
      PermissionsService.getPermissionByUser.useQuery,
    ).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        staleTime: 60000,
        gcTime: 60000,
      }),
    );
  });

  it('configures refetch options', () => {
    render(<Harness />);

    expect(
      PermissionsService.getPermissionByUser.useQuery,
    ).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      }),
    );
  });
});
