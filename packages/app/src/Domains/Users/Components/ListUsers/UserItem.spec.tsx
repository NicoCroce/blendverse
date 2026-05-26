import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserItem } from './UserItem';

vi.mock('@app/Aplication/Components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

vi.mock('@app/Aplication/Components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

const mockUser = {
  id: 1,
  name: 'Alice Johnson',
  mail: 'alice@test.com',
  rol: 'Admin',
  ownerId: 10,
  password: 'hashedPassword123',
} as never;

describe('UserItem', () => {
  it('renders user name', () => {
    render(<UserItem data={mockUser} />);
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('renders user email', () => {
    render(<UserItem data={mockUser} />);
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('renders role in badge', () => {
    render(<UserItem data={mockUser} />);
    expect(screen.getByTestId('badge')).toHaveTextContent('Admin');
  });

  it('renders ownerId', () => {
    render(<UserItem data={mockUser} />);
    expect(screen.getByText(/OwnerID.*10/)).toBeInTheDocument();
  });
});
