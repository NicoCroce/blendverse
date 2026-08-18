import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SegmentsFilterField } from '../SegmentsFilterField';

const { hasPermissionMock } = vi.hoisted(() => ({
  hasPermissionMock: vi.fn(),
}));

vi.mock('@app/Application/Hooks/useHasPermission', () => ({
  useHasPermission: () => ({ hasPermission: hasPermissionMock }),
}));

vi.mock('@app/Domains/Segments/Components/SegmentsFilter', () => ({
  SegmentsFilter: () => <div data-testid="segments-filter-stub" />,
}));

describe('SegmentsFilterField', () => {
  beforeEach(() => {
    hasPermissionMock.mockReset();
  });

  // T1 — US2/FR-003: admin con DASHBOARD_ACCESS ve etiqueta "Segmentos" + selector
  it('T1: renderiza etiqueta "Segmentos" y el selector con DASHBOARD_ACCESS', () => {
    hasPermissionMock.mockReturnValue(true);

    render(<SegmentsFilterField />);

    expect(screen.getByText('Segmentos')).toBeInTheDocument();
    expect(screen.getByTestId('segments-filter-stub')).toBeInTheDocument();
  });

  // T2 — US1/FR-001/002: empleado sin DASHBOARD_ACCESS → null (ni etiqueta ni selector)
  it('T2: retorna null sin DASHBOARD_ACCESS (ni etiqueta ni selector en el DOM)', () => {
    hasPermissionMock.mockReturnValue(false);

    const { container } = render(<SegmentsFilterField />);

    expect(container).toBeEmptyDOMElement();
  });

  // T3 — FR-008: durante la carga de permisos (data undefined → hasPermission false) → null, sin flash
  it('T3: retorna null durante la carga de permisos (sin flash)', () => {
    hasPermissionMock.mockReturnValue(false);

    const { container } = render(<SegmentsFilterField />);

    expect(container).toBeEmptyDOMElement();
  });

  // T4 — FR-009: con showLabel={false} y permiso → selector sin etiqueta
  it('T4: con showLabel={false} renderiza solo el selector, sin etiqueta', () => {
    hasPermissionMock.mockReturnValue(true);

    render(<SegmentsFilterField showLabel={false} />);

    expect(screen.getByTestId('segments-filter-stub')).toBeInTheDocument();
    expect(screen.queryByText('Segmentos')).not.toBeInTheDocument();
  });

  // T5 — defensa en profundidad: showLabel={false} sin permiso → null
  it('T5: con showLabel={false} y sin permiso retorna null', () => {
    hasPermissionMock.mockReturnValue(false);

    const { container } = render(<SegmentsFilterField showLabel={false} />);

    expect(container).toBeEmptyDOMElement();
  });
});
