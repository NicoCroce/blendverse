import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuAuth } from './MenuAuth';

const { useDeviceMock } = vi.hoisted(() => ({
  useDeviceMock: vi.fn(),
}));

vi.mock('@app/Aplication', () => ({
  MenuItem: ({ to, text }: { to: string; text: string; icon?: unknown }) => (
    <a href={to}>{text}</a>
  ),
  useDevice: useDeviceMock,
}));

vi.mock('../Users', () => ({
  USERS_CHANGE_PASSWORD: '/users/change-password',
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faArrowRightFromBracket: {},
  faUser: {},
}));

describe('MenuAuth', () => {
  it('always renders the Salir menu item', () => {
    useDeviceMock.mockReturnValue({ isMobile: false });
    render(<MenuAuth />);
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });

  it('renders Mi Cuenta only on mobile', () => {
    useDeviceMock.mockReturnValue({ isMobile: true });
    render(<MenuAuth />);
    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument();
  });

  it('does NOT render Mi Cuenta on desktop', () => {
    useDeviceMock.mockReturnValue({ isMobile: false });
    render(<MenuAuth />);
    expect(screen.queryByText('Mi Cuenta')).not.toBeInTheDocument();
  });
});
