import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sheet } from '@app/Application/Components/ui/sheet';
import { renderWithProviders } from '@app/test/renderWithProviders';
import { FiltersCertificatesForm } from '../FiltersCertificatesForm';

const { hasPermissionMock } = vi.hoisted(() => ({
  hasPermissionMock: vi.fn(),
}));

vi.mock('@app/Application/Hooks/useHasPermission', () => ({
  useHasPermission: () => ({ hasPermission: hasPermissionMock }),
}));

vi.mock('@app/Domains/Certificates/Hooks', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@app/Domains/Certificates/Hooks')>();
  return {
    ...actual,
    useGetCertificatesTypes: () => ({
      data: [{ id: 1, name: 'Certificado de trabajo' }],
    }),
  };
});

vi.mock('@app/Domains/Segments/Components/SegmentsFilter', () => ({
  SegmentsFilter: () => <div data-testid="segments-filter-stub" />,
}));

const availableYears = [2026, 2025, 2024];

describe('FiltersCertificatesForm', () => {
  beforeEach(() => {
    hasPermissionMock.mockReset();
  });

  // T8 — FR-003/007: admin ve "Segmentos" + resto de campos (tipo/fecha/año/estado)
  it('T8: admin con DASHBOARD_ACCESS ve el bloque Segmentos y el resto de campos', () => {
    hasPermissionMock.mockReturnValue(true);

    renderWithProviders(
      <Sheet>
        <FiltersCertificatesForm isAdmin availableYears={availableYears} />
      </Sheet>,
    );

    expect(screen.getByText('Segmentos')).toBeInTheDocument();
    expect(screen.getByTestId('segments-filter-stub')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Año')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  // T9 — US1/FR-002/007: empleado no ve "Segmentos"; resto de campos intactos
  it('T9: empleado sin DASHBOARD_ACCESS no ve el bloque Segmentos y conserva el resto', () => {
    hasPermissionMock.mockReturnValue(false);

    renderWithProviders(
      <Sheet>
        <FiltersCertificatesForm availableYears={availableYears} />
      </Sheet>,
    );

    expect(screen.queryByText('Segmentos')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('segments-filter-stub'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Año')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });
});
