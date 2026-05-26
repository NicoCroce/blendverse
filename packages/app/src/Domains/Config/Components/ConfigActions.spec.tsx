import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfigActions } from './ConfigActions';

vi.mock('@app/Aplication', () => ({
  Container: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe('ConfigActions', () => {
  it('renders "Guardar cambios" button', () => {
    render(
      <ConfigActions
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled={false}
        isPending={false}
      />,
    );
    expect(screen.getByText('Guardar cambios')).toBeInTheDocument();
  });

  it('renders "Descartar" button', () => {
    render(
      <ConfigActions
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled={false}
        isPending={false}
      />,
    );
    expect(screen.getByText('Descartar')).toBeInTheDocument();
  });

  it('calls onConfirm when "Guardar cambios" is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfigActions
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
        disabled={false}
        isPending={false}
      />,
    );

    fireEvent.click(screen.getByText('Guardar cambios'));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when "Descartar" is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfigActions
        onConfirm={vi.fn()}
        onCancel={handleCancel}
        disabled={false}
        isPending={false}
      />,
    );

    fireEvent.click(screen.getByText('Descartar'));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('disables "Guardar" button when disabled=true', () => {
    render(
      <ConfigActions
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled={true}
        isPending={false}
      />,
    );
    expect(screen.getByText('Guardar cambios')).toBeDisabled();
  });

  it('disables "Guardar" button when isPending=true', () => {
    render(
      <ConfigActions
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        disabled={false}
        isPending={true}
      />,
    );
    expect(screen.getByText('Guardar cambios')).toBeDisabled();
  });
});
