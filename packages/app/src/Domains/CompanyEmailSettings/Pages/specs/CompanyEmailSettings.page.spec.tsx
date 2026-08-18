import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyEmailSettingsPage } from '../CompanyEmailSettings.page';

const mocks = vi.hoisted(() => ({
  useDevice: vi.fn().mockReturnValue({ isMobile: false }),
  usePage: vi.fn(),
}));

vi.mock('@app/Application', () => {
  const passthrough = ({
    children,
    headerRight,
    row: _row,
    align: _align,
    justify: _justify,
    space: _space,
    ...props
  }: {
    children?: ReactNode;
    headerRight?: ReactNode;
    row?: boolean;
    align?: string;
    justify?: string;
    space?: string;
    [key: string]: unknown;
  }) => createElement('div', props, headerRight, children);
  const Button = ({
    children,
    onClick,
    isLoading,
    disabled,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
  }) =>
    createElement(
      'button',
      { onClick, disabled: disabled || isLoading },
      children,
    );
  const Text = Object.assign(passthrough, { Muted: passthrough });
  const EmptyState = ({ title }: { title: string; description?: string }) =>
    createElement('div', {}, title);
  return {
    Button,
    Container: passthrough,
    EmptyScreenError: ({ message }: { message?: string }) =>
      createElement('div', { role: 'alert' }, message),
    EmptyState,
    Page: passthrough,
    Text,
    useDevice: mocks.useDevice,
  };
});
vi.mock('../../Hooks/useCompanyEmailSettingsPage', () => ({
  useCompanyEmailSettingsPage: mocks.usePage,
}));
vi.mock('../../Components/CompanyEmailSettingsSkeleton', () => ({
  CompanyEmailSettingsSkeleton: () => <div data-testid="settings-skeleton" />,
}));
vi.mock('../../Components', () => ({
  ContentSection: () => <div data-testid="content-section" />,
  DeliveryRouteRail: () => <div data-testid="delivery-rail" />,
  MorningReportSection: () => <div data-testid="morning-report" />,
  RecipientsSection: () => <div data-testid="recipients-section" />,
  SettingsSummary: ({ compact }: { compact?: boolean }) => (
    <div data-testid={compact ? 'mobile-summary' : 'desktop-summary'} />
  ),
}));

const successPage = () => ({
  query: {
    data: { version: 4, currentTerms: null },
    isLoading: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  },
  form: { formState: { isDirty: false }, register: vi.fn(), setValue: vi.fn() },
  delivery: [{ code: 'admin_license_created', enabled: true }],
  recipients: [{ email: 'ops@acme.test' }],
  reportSections: [{ code: 'statistical_summary', enabled: true }],
  welcomeMessage: null,
  termsContent: '',
  recipientDraft: '',
  recipientError: undefined,
  validationMessages: {
    recipients: undefined,
    reportSections: undefined,
    welcomeMessage: undefined,
    termsContent: undefined,
  },
  setRecipientDraft: vi.fn(),
  handleAddRecipient: vi.fn(),
  handleRemoveRecipient: vi.fn(),
  toggleDelivery: vi.fn(),
  toggleReportSection: vi.fn(),
  contentTab: 'welcome',
  setContentTab: vi.fn(),
  publishConfirmation: false,
  requestPublishTerms: vi.fn(),
  cancelPublishTerms: vi.fn(),
  confirmPublishTerms: vi.fn(),
  reloadCurrent: vi.fn(),
  conflict: false,
  savedFeedback: undefined,
  activeDeliveryCount: 1,
  activeReportCount: 1,
  hasActiveAdminDelivery: true,
  isSaving: false,
  isPublishing: false,
  saveError: undefined,
  publishError: undefined,
  submit: vi.fn(),
  currentVersion: 4,
});

describe('CompanyEmailSettingsPage states and responsive composition', () => {
  beforeEach(() => {
    mocks.useDevice.mockReturnValue({ isMobile: false });
  });

  it('renders a structured loading state without editable controls', () => {
    const query = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    };
    mocks.usePage.mockReturnValue({ query });
    render(<CompanyEmailSettingsPage />);
    expect(screen.getByTestId('settings-skeleton')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Guardar cambios' }),
    ).not.toBeInTheDocument();
  });

  it('renders actionable query error and retries without presenting partial data', () => {
    const refetch = vi.fn();
    mocks.usePage.mockReturnValue({
      query: {
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'No disponible' },
        refetch,
      },
    });
    render(<CompanyEmailSettingsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('No disponible');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('delivery-rail')).not.toBeInTheDocument();
  });

  it('renders an actionable empty state when the snapshot is absent', () => {
    const refetch = vi.fn();
    mocks.usePage.mockReturnValue({
      query: {
        data: undefined,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch,
      },
    });
    render(<CompanyEmailSettingsPage />);
    expect(
      screen.getByText('No hay configuración disponible'),
    ).toBeInTheDocument();
  });

  it('mounts exactly one summary branch for desktop and mobile', () => {
    mocks.usePage.mockReturnValue(successPage());
    mocks.useDevice.mockReturnValue({ isMobile: false });
    const desktop = render(<CompanyEmailSettingsPage />);
    expect(screen.getByTestId('desktop-summary')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-summary')).not.toBeInTheDocument();
    desktop.unmount();

    mocks.useDevice.mockReturnValue({ isMobile: true });
    render(<CompanyEmailSettingsPage />);
    expect(screen.getByTestId('mobile-summary')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-summary')).not.toBeInTheDocument();
  });

  it('shows unsaved feedback and locks the save action while a mutation is pending', () => {
    const page = successPage();
    page.form.formState.isDirty = true;
    page.isSaving = true;
    mocks.usePage.mockReturnValue(page);
    render(<CompanyEmailSettingsPage />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Hay cambios sin guardar',
    );
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    ).toBeDisabled();
  });
});
