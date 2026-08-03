import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserSegmentsToolbar } from '../UserSegmentsToolbar';

const { hasPermissionMock } = vi.hoisted(() => ({
  hasPermissionMock: vi.fn(),
}));

vi.mock('@app/Application/Hooks/useHasPermission', () => ({
  useHasPermission: () => ({ hasPermission: hasPermissionMock }),
}));

vi.mock('@app/Domains/Segments/Components/SegmentsFilter', () => ({
  SegmentsFilter: () => <div data-testid="segments-filter-stub" />,
}));

const defaultProps = {
  search: '',
  onSearchChange: () => {},
  withoutSegments: false,
  onWithoutSegmentsChange: () => {},
};

describe('UserSegmentsToolbar', () => {
  beforeEach(() => {
    hasPermissionMock.mockReset();
  });

  // T10 — US4 escenario 1: admin ve el selector de segmentos SIN etiqueta "Segmentos"
  it('T10: admin ve el selector de segmentos sin etiqueta "Segmentos"', () => {
    hasPermissionMock.mockReturnValue(true);

    render(<UserSegmentsToolbar {...defaultProps} />);

    expect(screen.getByTestId('segments-filter-stub')).toBeInTheDocument();
    expect(screen.queryByText('Segmentos')).not.toBeInTheDocument();
  });

  // T11 — US4 escenario 2 (defensa en profundidad): empleado no ve el selector
  it('T11: empleado sin DASHBOARD_ACCESS no ve el selector de segmentos', () => {
    hasPermissionMock.mockReturnValue(false);

    render(<UserSegmentsToolbar {...defaultProps} />);

    expect(
      screen.queryByTestId('segments-filter-stub'),
    ).not.toBeInTheDocument();
  });
});
