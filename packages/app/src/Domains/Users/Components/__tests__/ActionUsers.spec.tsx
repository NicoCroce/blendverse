import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ActionsUsers } from '../ListUsers/ActionUsers';
import { USERS_UPDATE_ROUTE } from '../../Users.routes';

const { mutateMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
}));

vi.mock('../../Hooks', () => ({
  useDeleteUser: () => ({ mutate: mutateMock }),
}));

vi.mock('@app/Aplication/Components/Organisms/EditDelete', () => ({
  EditDelete: ({
    editPath,
    onDelete,
  }: {
    editPath: string;
    onDelete: () => void;
  }) => (
    <div>
      <a href={editPath} data-testid="edit-link">
        Edit
      </a>
      <button onClick={onDelete} data-testid="delete-btn">
        Delete
      </button>
    </div>
  ),
}));

const makeRow = (id: string) =>
  ({
    getValue: (key: string) => (key === 'id' ? id : null),
  }) as never;

describe('ActionsUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el link de edición con la ruta correcta', () => {
    render(
      <MemoryRouter>
        <ActionsUsers row={makeRow('5')} />
      </MemoryRouter>,
    );
    const expectedPath = USERS_UPDATE_ROUTE.replace(':id', '5');
    expect(screen.getByTestId('edit-link')).toHaveAttribute(
      'href',
      expectedPath,
    );
  });

  it('llama a mutate con el id numérico al confirmar eliminación', () => {
    render(
      <MemoryRouter>
        <ActionsUsers row={makeRow('3')} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(mutateMock).toHaveBeenCalledWith(3);
  });

  it('no llama a mutate si no se hace click en el botón de eliminar', () => {
    render(
      <MemoryRouter>
        <ActionsUsers row={makeRow('7')} />
      </MemoryRouter>,
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
