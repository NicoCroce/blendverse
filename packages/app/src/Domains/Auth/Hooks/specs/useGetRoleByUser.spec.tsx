import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsService } from '../../Auth.service';
import { useGetRoleByUser } from '../useGetRoleByUser';

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock('../../Auth.service', () => ({
  PermissionsService: {
    getRoleByUser: {
      useQuery: useQueryMock,
    },
  },
}));

const Harness = ({ userId }: { userId?: number }) => {
  useGetRoleByUser(userId);
  return null;
};

describe('useGetRoleByUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: 'Full Admin' });
  });

  it('calls useQuery with enabled=true when userId is provided', () => {
    render(<Harness userId={5} />);

    expect(PermissionsService.getRoleByUser.useQuery).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ enabled: true }),
    );
  });

  it('calls useQuery with enabled=false when userId is undefined', () => {
    render(<Harness userId={undefined} />);

    expect(PermissionsService.getRoleByUser.useQuery).toHaveBeenCalledWith(
      undefined as unknown as number,
      expect.objectContaining({ enabled: false }),
    );
  });

  it('passes staleTime and gcTime as 0', () => {
    render(<Harness userId={3} />);

    expect(PermissionsService.getRoleByUser.useQuery).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ staleTime: 0, gcTime: 0 }),
    );
  });
});
