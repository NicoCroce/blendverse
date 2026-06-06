import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuMain } from '../MenuNavigation';

vi.mock('@app/Application', () => ({
  MenuItem: ({
    to,
    text,
  }: {
    to: string;
    text: string;
    icon?: unknown;
    permission?: unknown;
  }) => <a href={to}>{text}</a>,
  DASHBOARD_ACCESS: 'DASHBOARD_ACCESS',
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faDashboard: {},
}));

describe('MenuMain', () => {
  it('renders the Dashboard menu item', () => {
    render(<MenuMain />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders a link to the main route', () => {
    render(<MenuMain />);
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toBeInTheDocument();
  });
});
