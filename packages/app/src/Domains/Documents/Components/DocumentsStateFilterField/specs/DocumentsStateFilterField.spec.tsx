import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentsStateFilterField } from '../DocumentsStateFilterField';
import {
  PENDING,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
} from '../../../Document.entity';

describe('DocumentsStateFilterField (FR-001, FR-002, FR-006)', () => {
  it('renderiza las 3 opciones con labels literales del dominio (FR-001)', () => {
    render(<DocumentsStateFilterField value={PENDING} onChange={() => {}} />);

    expect(screen.getByText('Estado de conformidad')).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Pendientes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Firmados bajo conformidad' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Firmados sin conformidad' }),
    ).toBeInTheDocument();
    // No ofrece la opción legacy validados
    expect(
      screen.queryByRole('radio', { name: 'Validados' }),
    ).not.toBeInTheDocument();
  });

  it('el estado activo refleja el valor controlado (FR-006)', () => {
    render(
      <DocumentsStateFilterField
        value={UNDER_CONFORMITY}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('radio', { name: 'Firmados bajo conformidad' }),
    ).toHaveAttribute('data-state', 'on');
    expect(screen.getByRole('radio', { name: 'Pendientes' })).toHaveAttribute(
      'data-state',
      'off',
    );
  });

  it('onChange propaga el estado seleccionado al hacer click (FR-006)', () => {
    const onChange = vi.fn();
    render(<DocumentsStateFilterField value={PENDING} onChange={onChange} />);

    fireEvent.click(
      screen.getByRole('radio', { name: 'Firmados sin conformidad' }),
    );

    expect(onChange).toHaveBeenCalledWith(WITHOUT_CONFORMITY);
  });

  it('es visible sin depender de permisos (FR-002): renderiza sin DASHBOARD_ACCESS', () => {
    render(<DocumentsStateFilterField value={PENDING} onChange={() => {}} />);

    expect(screen.getByText('Estado de conformidad')).toBeInTheDocument();
  });
});
