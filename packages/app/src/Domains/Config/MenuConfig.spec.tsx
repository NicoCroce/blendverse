import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuConfig } from './MenuConfig';

vi.mock('@app/Aplication', () => ({
  MenuItem: ({ to, text }: { to: string; text: string; icon?: unknown }) => (
    <a href={to}>{text}</a>
  ),
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faGear: {},
}));

describe('MenuConfig', () => {
  it('renders the Configurar menu item', () => {
    render(<MenuConfig />);
    expect(screen.getByText('Configurar')).toBeInTheDocument();
  });

  it('renders a link to the config route', () => {
    render(<MenuConfig />);
    const link = screen.getByRole('link', { name: 'Configurar' });
    expect(link).toBeInTheDocument();
  });
});
