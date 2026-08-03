import { fireEvent, screen } from '@testing-library/react';
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

  // T6 — FR-003/007: admin ve "Segmentos" + resto de campos (nombre/estado)
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
    expect(screen.getByText('Estado de conformidad')).toBeInTheDocument();
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
    expect(screen.getByText('Estado de conformidad')).toBeInTheDocument();
  });

  // US1/FR-001: el selector de estado ofrece exactamente las tres opciones
  it('T7.1: el selector de estado muestra las tres opciones de conformidad', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
    );

    expect(
      screen.getByRole('radio', { name: 'Pendientes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Firmados bajo conformidad' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Firmados sin conformidad' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'Validados' }),
    ).not.toBeInTheDocument();
  });

  // US1/FR-009: el estado por defecto del selector es "Pendientes"
  it('T7.2: el selector arranca con "Pendientes" como estado por defecto', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
    );

    expect(screen.getByRole('radio', { name: 'Pendientes' })).toHaveAttribute(
      'data-state',
      'on',
    );
  });

  // US1/FR-006: si la URL trae un estado, el selector lo refleja (restauración)
  it('T8.1: restaura la selección de estado desde la URL', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
      { initialEntries: ['/?state=bajo_conformidad'] },
    );

    expect(
      screen.getByRole('radio', { name: 'Firmados bajo conformidad' }),
    ).toHaveAttribute('data-state', 'on');
  });

  // US1/FR-009: "Limpiar filtros" vuelve el selector a "Pendientes"
  it('T8.2: limpiar filtros vuelve el estado a "Pendientes"', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
      { initialEntries: ['/?state=sin_conformidad'] },
    );

    expect(
      screen.getByRole('radio', { name: 'Firmados sin conformidad' }),
    ).toHaveAttribute('data-state', 'on');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.getByRole('radio', { name: 'Pendientes' })).toHaveAttribute(
      'data-state',
      'on',
    );
    expect(
      screen.getByRole('radio', { name: 'Firmados sin conformidad' }),
    ).toHaveAttribute('data-state', 'off');
  });

  // US3 (FR-007): URL con state=validados no rompe el selector (valor legacy sin opción de UI)
  it('T8.3: state=validados en la URL no rompe el selector (US3)', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersDocumentsForm />
      </Sheet>,
      { initialEntries: ['/?state=validados'] },
    );

    // El form no arroja error y el selector sigue presente con sus 3 opciones
    expect(
      screen.getByRole('radio', { name: 'Pendientes' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Validados')).not.toBeInTheDocument();
  });
});
