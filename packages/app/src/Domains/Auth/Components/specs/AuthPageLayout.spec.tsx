import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthPageLayout } from '../AuthPageLayout';

vi.mock('@app/Application', () => ({
  HalfPage: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
    background?: string;
    left?: React.ReactNode;
  }) => (
    <div>
      <span data-testid="halfpage-title">{title}</span>
      {children}
    </div>
  ),
  Title: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => <h3 data-variant={variant}>{children}</h3>,
}));

describe('AuthPageLayout', () => {
  it('renders title via HalfPage', () => {
    render(
      <AuthPageLayout title="Bienvenido">
        <span>Content</span>
      </AuthPageLayout>,
    );
    expect(screen.getByTestId('halfpage-title')).toHaveTextContent(
      'Bienvenido',
    );
  });

  it('renders children', () => {
    render(
      <AuthPageLayout title="Test">
        <span data-testid="child">Child content</span>
      </AuthPageLayout>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders subtitle Title when provided', () => {
    render(
      <AuthPageLayout title="Test" subtitle="Sub title">
        <span>Content</span>
      </AuthPageLayout>,
    );
    expect(screen.getByText('Sub title')).toBeInTheDocument();
  });

  it('does NOT render subtitle when not provided', () => {
    render(
      <AuthPageLayout title="Test">
        <span>Content</span>
      </AuthPageLayout>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
