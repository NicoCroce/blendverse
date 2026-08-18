import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DisclaimerModal } from '../DisclaimerModal';

const { useGlobalStore, useGetDisclaimerText, query } = vi.hoisted(() => ({
  useGlobalStore: vi.fn(),
  useGetDisclaimerText: vi.fn(),
  query: vi.fn(),
}));

vi.mock('@app/Application', () => ({ useGlobalStore }));
vi.mock('@app/Application/Components', () => ({
  EmptyScreenError: ({ message }: { message?: string }) =>
    createElement('div', { role: 'alert' }, message),
  Modal: ({ children, title }: { children: ReactNode; title: string }) =>
    createElement(
      'section',
      { 'data-testid': 'modal' },
      createElement('h2', {}, title),
      children,
    ),
}));
vi.mock('@app/Application/Components/ui/skeleton', () => ({
  Skeleton: () => createElement('div', { 'data-testid': 'skeleton' }),
}));
vi.mock('../Hooks/useDisclaimer', () => ({
  useGetDisclaimerText,
}));
vi.mock('../DisclaimerForm', () => ({
  DisclaimerForm: ({ termsVersion }: { termsVersion: number | null }) =>
    createElement(
      'div',
      { 'data-testid': 'disclaimer-form' },
      String(termsVersion),
    ),
}));

describe('DisclaimerModal', () => {
  it('renders the content and forwards its real terms version to the form', () => {
    useGlobalStore.mockReturnValue({
      data: { pendingDisclaimer: true },
      setQueryData: vi.fn(),
    });
    useGetDisclaimerText.mockReturnValue(query);
    query.mockReturnValue({
      data: { content: 'Published terms', version: 7 },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<DisclaimerModal />);

    expect(screen.getByText('Published terms')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer-form')).toHaveTextContent('7');
  });

  it('passes null to the form for the legacy fallback version', () => {
    useGlobalStore.mockReturnValue({
      data: { pendingDisclaimer: true },
      setQueryData: vi.fn(),
    });
    useGetDisclaimerText.mockReturnValue(query);
    query.mockReturnValue({
      data: { content: 'Legacy terms', version: null },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<DisclaimerModal />);

    expect(screen.getByText('Legacy terms')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer-form')).toHaveTextContent('null');
  });
});
