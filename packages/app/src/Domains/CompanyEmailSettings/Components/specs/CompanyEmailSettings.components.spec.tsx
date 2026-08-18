import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import {
  EMAIL_CATALOG_CODES,
  REPORT_SECTION_CODES,
} from '../../CompanyEmailSettings.entity';
import type { TCompanyEmailSettingsForm } from '../../Hooks/useCompanyEmailSettingsPage';
import { ContentSection } from '../ContentSection';
import { DeliveryRouteRail } from '../DeliveryRouteRail';
import { MorningReportSection } from '../MorningReportSection';
import { RecipientsSection } from '../RecipientsSection';

const delivery = EMAIL_CATALOG_CODES.map((code) => ({ code, enabled: true }));
const sections = REPORT_SECTION_CODES.map((code) => ({ code, enabled: true }));

describe('CompanyEmailSettings presentation rules', () => {
  it('renders route rail grouped by audience and forwards toggle changes', () => {
    const onToggle = vi.fn();
    render(<DeliveryRouteRail delivery={delivery} onToggle={onToggle} />);

    expect(screen.getByText('Administradores')).toBeInTheDocument();
    expect(screen.getByText('Empleados')).toBeInTheDocument();
    expect(screen.getAllByText('Solicitante').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('checkbox')).toHaveLength(9);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Nueva licencia cargada: Activo' }),
    );
    expect(onToggle).toHaveBeenCalledWith('admin_license_created', false);
  });

  it('shows contextual recipient empty state and validates the visible draft', () => {
    const onAdd = vi.fn();
    render(
      <RecipientsSection
        recipients={[]}
        recipientDraft="bad"
        recipientError="Ingresa una dirección de email válida."
        hasActiveAdminDelivery
        onRecipientDraftChange={vi.fn()}
        onAddRecipient={onAdd}
        onRemoveRecipient={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Todavía no hay destinatarios administrativos'),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'dirección de email válida',
    );
    const addButtons = screen.getAllByRole('button', {
      name: /Agregar destinatario/i,
    });
    fireEvent.click(addButtons[addButtons.length - 1]);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('keeps the fixed morning schedule and exposes all seven selectable sections', () => {
    const onToggle = vi.fn();
    render(
      <MorningReportSection
        sections={sections}
        reportEnabled
        validationError={undefined}
        onToggle={onToggle}
      />,
    );

    expect(
      screen.getByText('Elige qué debe llegar a las 09:00'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/zona horaria|cambiar el horario/i),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Licencias pendientes de aprobación: Incluida',
      }),
    );
    expect(onToggle).toHaveBeenCalledWith('pending_licenses', false);
  });

  it('separates welcome editing from confirmed terms publication and shows safe preview', () => {
    const Harness = () => {
      const form = useForm<TCompanyEmailSettingsForm>({
        defaultValues: {
          delivery,
          adminRecipients: [],
          reportSections: sections,
          welcomeMessage: '<p>Hello</p>',
          termsContent: '<p>Legal</p>',
        },
      });
      return (
        <ContentSection
          activeTab="terms"
          welcomeMessage="<p>Hello</p>"
          termsContent="<p>Legal</p><script>alert(1)</script>"
          currentTermsVersion={2}
          publishConfirmation
          isPublishing
          register={form.register}
          setValue={form.setValue}
          onTabChange={vi.fn()}
          onRequestPublish={vi.fn()}
          onCancelPublish={vi.fn()}
          onConfirmPublish={vi.fn()}
        />
      );
    };

    render(<Harness />);
    expect(screen.getByText('Vigente: v2')).toBeInTheDocument();
    expect(
      screen.getByText('Esto creará una nueva versión legal.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/La publicación es independiente/),
    ).toBeInTheDocument();
    expect(screen.getByText('Legalalert(1)')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirmar publicación/i }),
    ).toBeDisabled();
  });
});
