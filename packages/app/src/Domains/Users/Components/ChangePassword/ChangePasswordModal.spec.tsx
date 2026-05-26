import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChangePasswordModal } from './ChangePasswordModal';

const { useGlobalStoreMock } = vi.hoisted(() => ({
  useGlobalStoreMock: vi.fn(),
}));

vi.mock('@app/Aplication', () => ({
  useGlobalStore: useGlobalStoreMock,
}));

vi.mock('@app/Aplication/Components', () => ({
  Modal: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
    isOpen: boolean;
    description?: string;
  }) => (
    <div data-testid="modal">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock('./ChangePasswordForm', () => ({
  ChangePasswordForm: () => <div data-testid="change-password-form" />,
}));

describe('ChangePasswordModal', () => {
  it('renders nothing when dataUser is null', () => {
    useGlobalStoreMock.mockReturnValue({ data: null });

    const { container } = render(<ChangePasswordModal />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when renewPassword is false', () => {
    useGlobalStoreMock.mockReturnValue({
      data: { id: 1, name: 'Alice', renewPassword: false },
    });

    const { container } = render(<ChangePasswordModal />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when renewPassword is true', () => {
    useGlobalStoreMock.mockReturnValue({
      data: { id: 1, name: 'Alice', renewPassword: true },
    });

    render(<ChangePasswordModal />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Actualizar constraseña')).toBeInTheDocument();
  });

  it('renders ChangePasswordForm inside modal', () => {
    useGlobalStoreMock.mockReturnValue({
      data: { id: 1, name: 'Alice', renewPassword: true },
    });

    render(<ChangePasswordModal />);

    expect(screen.getByTestId('change-password-form')).toBeInTheDocument();
  });
});
