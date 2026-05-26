import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemesService } from '../Config.service';
import { useGetThemes } from './useGetThemes';

const { isLoggedMock, useQueryMock } = vi.hoisted(() => ({
  isLoggedMock: vi.fn(),
  useQueryMock: vi.fn(),
}));

vi.mock('@app/Aplication/Helpers/isLogged', () => ({
  isLogged: isLoggedMock,
}));

vi.mock('../Config.service', () => ({
  ThemesService: {
    getAll: {
      useQuery: useQueryMock,
    },
  },
}));

const Harness = () => {
  useGetThemes();
  return null;
};

describe('useGetThemes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: [] });
  });

  it('calls useQuery with enabled=true when user is logged', () => {
    isLoggedMock.mockReturnValue(true);

    render(<Harness />);

    expect(ThemesService.getAll.useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: true }),
    );
  });

  it('calls useQuery with enabled=false when user is not logged', () => {
    isLoggedMock.mockReturnValue(false);

    render(<Harness />);

    expect(ThemesService.getAll.useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: false }),
    );
  });
});
