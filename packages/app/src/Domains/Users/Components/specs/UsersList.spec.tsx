import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { UsersList } from '../ListUsers/UsersList';

const { useGetUsersMock } = vi.hoisted(() => ({
  useGetUsersMock: vi.fn(),
}));

vi.mock('../../Hooks', () => ({
  useGetUsers: useGetUsersMock,
}));

vi.mock(
  '@app/Application/Components/Organisms/DataCollection/DataCollection',
  () => ({
    DataCollection: ({
      data,
      isLoading,
      table,
    }: {
      data: unknown[];
      isLoading: boolean;
      table: React.ReactNode;
    }) => (
      <div data-testid="data-collection">
        {isLoading && <span data-testid="is-fetching" />}
        <span data-testid="data-count">{data.length}</span>
        <div data-testid="table-slot">{table}</div>
      </div>
    ),
  }),
);

vi.mock(
  '@app/Application/Components/Organisms/DataCollection/DataTable',
  () => {
    const DataTable = ({ data }: { data: unknown[] }) => (
      <table data-testid="data-table">
        <tbody>
          <tr>
            <td>{data.length}</td>
          </tr>
        </tbody>
      </table>
    );
    const Skeleton = () => <div data-testid="data-table-skeleton" />;
    Skeleton.displayName = 'DataTable.Skeleton';
    DataTable.Skeleton = Skeleton;
    return { DataTable };
  },
);

vi.mock('../ListUsers/UserCard', () => {
  const UserCard = () => <div data-testid="user-card" />;
  UserCard.displayName = 'UserCard';
  return { UserCard };
});

vi.mock('../ListUsers/ColumnsUsersTable', () => ({
  columns: [],
}));

vi.mock('@app/Application', () => ({
  initPagination: { currentPage: 1, hasMore: false },
}));

const mockData = {
  data: [
    { id: 1, name: 'Juan', mail: 'juan@test.com' },
    { id: 2, name: 'Ana', mail: 'ana@test.com' },
  ],
  meta: { currentPage: 1, hasMore: false },
};

describe('UsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el DataTable.Skeleton cuando está cargando sin datos', () => {
    useGetUsersMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('data-table-skeleton')).toBeInTheDocument();
  });

  it('renderiza el DataTable con datos cuando la carga finalizó', () => {
    useGetUsersMock.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    });
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('pasa la cantidad de ítems correcta a DataCollection', () => {
    useGetUsersMock.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    });
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('data-count')).toHaveTextContent('2');
  });

  it('muestra la lista vacía cuando no hay datos', () => {
    useGetUsersMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('data-count')).toHaveTextContent('0');
  });
});
