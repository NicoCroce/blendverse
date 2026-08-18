import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeftContentPage } from '../LeftContentPage';

vi.mock('@app/Application', () => ({
  Container: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Title: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <h1 data-variant={variant} className={className}>
      {children}
    </h1>
  ),
}));

describe('LeftContentPage', () => {
  it('renders default title', () => {
    render(<LeftContentPage />);
    expect(screen.getByText('Macrosistemas')).toBeInTheDocument();
  });

  it('renders default subtitle', () => {
    render(<LeftContentPage />);
    expect(screen.getByText('Seguridad y Autenticación')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<LeftContentPage title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders custom subtitle when provided', () => {
    render(<LeftContentPage subtitle="Custom Subtitle" />);
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });
});
