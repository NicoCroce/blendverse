import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserCard } from '../UserCard';

const { useMutationMock } = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
}));

vi.mock('../../../Hooks', () => ({
  useDeleteUser: () => ({ mutate: useMutationMock }),
}));

vi.mock('@app/Application/Components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

vi.mock('@app/Application/Components/Organisms/EditDelete', () => ({
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

vi.mock('@app/Application/Components/Molecules/Text', () => {
  const Stub = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>;
  Stub.Muted = Stub;
  Stub.Label = Stub;
  return { Text: Stub };
});

vi.mock('@app/Application/Components/Layout/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUser = {
  id: 7,
  name: 'Bob Smith',
  mail: 'bob@test.com',
  rol: 'Editor',
  ownerId: 10,
  password: 'hashedPassword123',
} as never;

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard data={mockUser} />);
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('renders user ID', () => {
    render(<UserCard data={mockUser} />);
    expect(screen.getByText(/ID:.*7/)).toBeInTheDocument();
  });

  it('renders edit link pointing to update route', () => {
    render(<UserCard data={mockUser} />);
    const link = screen.getByTestId('edit-link');
    expect(link.getAttribute('href')).toContain('7');
  });

  it('calls deleteUser mutate when delete is clicked', () => {
    render(<UserCard data={mockUser} />);
    screen.getByTestId('delete-btn').click();
    expect(useMutationMock).toHaveBeenCalledWith(7);
  });
});
