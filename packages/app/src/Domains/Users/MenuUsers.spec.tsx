import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuUsers } from './MenuUsers';

vi.mock('@app/Aplication', () => ({
  MenuItem: ({
    to,
    text,
  }: {
    to: string;
    text: string;
    icon?: unknown;
    permission?: unknown;
  }) => <a href={to}>{text}</a>,
  USER_ACCESS: 'USER_ACCESS',
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faUserShield: {},
}));

describe('MenuUsers', () => {
  it('renders the Usuarios menu item', () => {
    render(<MenuUsers />);
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('renders a link to the users route', () => {
    render(<MenuUsers />);
    const link = screen.getByRole('link', { name: 'Usuarios' });
    expect(link).toBeInTheDocument();
  });
});
