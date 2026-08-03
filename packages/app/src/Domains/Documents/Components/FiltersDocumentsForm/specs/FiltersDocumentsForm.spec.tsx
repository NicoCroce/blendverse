import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sheet } from '@app/Application/Components/ui/sheet';
import { renderWithProviders } from '@app/test/renderWithProviders';
import { FiltersDocumentsForm } from '../FiltersDocumentsForm';

const { hasPermissionMock } = vi.hoisted(() => ({
  hasPermissionMock: vi.fn(),
}));

vi.mock('@app/Application/Hooks/useHasPermission', () => ({
  useHasPermission: () => ({ hasPermission: hasPermissionMock }),
}));

vi.mock('@app/Domains/Documents/Hooks/useGetDocumentsTypes', () => ({
  useGetDocumentsTypes: () => ({
    data: [{ id: 1, denominacion: 'Factura' }],
  }),
}));

vi.mock('@app/Domains/Segments/Components/SegmentsFilter', () => ({
  SegmentsFilter: () => <div data-testid="segments-filter-stub" />,
}));

describe('FiltersDocumentsForm', () => {
  beforeEach(() => {
    hasPermissionMock.mockReset();
  });

  // T6 — FR-003/007: admin ve "Segmentos" + resto de campos (nombre/estado/tipo)
  it('T6: admin con DASHBOARD_ACCESS ve el bloque Segmentos y el resto de campos', () => {
    hasPermissionMock.mockReturnValue(true);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
    );

    expect(screen.getByText('Segmentos')).toBeInTheDocument();
    expect(screen.getByTestId('segments-filter-stub')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del documento')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
  });

  // T7 — US1/FR-001/007: empleado no ve "Segmentos"; resto de campos intactos
  it('T7: empleado sin DASHBOARD_ACCESS no ve el bloque Segmentos y conserva el resto', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
    );

    expect(screen.queryByText('Segmentos')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('segments-filter-stub'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del documento')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
  });
});
