import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OwnserSysService } from '../Config.service';
import { useGetOwnerTheme } from './useGetOwnerTheme';

const { isLoggedMock, useQueryMock } = vi.hoisted(() => ({
  isLoggedMock: vi.fn(),
  useQueryMock: vi.fn(),
}));

vi.mock('@app/Aplication/Helpers/isLogged', () => ({
  isLogged: isLoggedMock,
}));

vi.mock('../Config.service', () => ({
  OwnserSysService: {
    getOwnerTheme: {
      useQuery: useQueryMock,
    },
  },
}));

const Harness = () => {
  useGetOwnerTheme();
  return null;
};

describe('useGetOwnerTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: 2 });
  });

  it('calls useQuery with enabled=true when user is logged', () => {
    isLoggedMock.mockReturnValue(true);

    render(<Harness />);

    expect(OwnserSysService.getOwnerTheme.useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: true }),
    );
  });

  it('calls useQuery with enabled=false when user is not logged', () => {
    isLoggedMock.mockReturnValue(false);

    render(<Harness />);

    expect(OwnserSysService.getOwnerTheme.useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: false }),
    );
  });

  it('exposes dataOwnerTheme from query data', () => {
    isLoggedMock.mockReturnValue(true);
    useQueryMock.mockReturnValue({ data: 4, isLoading: false });

    let capturedData: unknown;
    const CheckHarness = () => {
      const { dataOwnerTheme } = useGetOwnerTheme();
      // Usar useEffect para capturar el valor sin side effect en render
      React.useEffect(() => {
        capturedData = dataOwnerTheme;
      }, [dataOwnerTheme]);
      return null;
    };

    render(<CheckHarness />);
    expect(capturedData).toBe(4);
  });
});
