import { inferRouterOutputs } from '@trpc/server';
import type { TMainRouter } from '@server/Infrastructure/Routes/Router';

type TCompanyEmailSettingsRouterOutput =
  inferRouterOutputs<TMainRouter>['companyEmailSettings'];

export type TCompanyEmailSettings = TCompanyEmailSettingsRouterOutput['get'];
export type TCompanyEmailDelivery = TCompanyEmailSettings['deliveries'][number];
export type TCompanyEmailRecipient =
  TCompanyEmailSettings['recipients'][number];
export type TCompanyEmailReportSection =
  TCompanyEmailSettings['reportSections'][number];
export type TCompanyTermsVersion = NonNullable<
  TCompanyEmailSettings['currentTerms']
>;
export type TCompanyEmailCode = TCompanyEmailDelivery['code'];
export type TCompanyReportSectionCode = TCompanyEmailReportSection['code'];

export const EMAIL_CATALOG_CODES = [
  'admin_license_created',
  'employee_license_status_changed',
  'employee_document_signed',
  'admin_document_signed',
  'employee_terms_reminder',
  'admin_daily_report',
  'employee_daily_reminder',
  'employee_document_assigned',
  'requester_document_manual',
] as const satisfies readonly TCompanyEmailCode[];

export const REPORT_SECTION_CODES = [
  'statistical_summary',
  'employees_on_leave_today',
  'pending_licenses',
  'unsigned_documents',
  'pending_terms_acceptance',
  'upcoming_vacations',
  'expiring_licenses',
] as const satisfies readonly TCompanyReportSectionCode[];

export const EMAIL_ROUTE_PRESENTATION: Record<
  TCompanyEmailCode,
  {
    label: string;
    audienceLabel: string;
    source: string;
    destination: string;
    triggerLabel: string;
    description: string;
  }
> = {
  admin_license_created: {
    label: 'Nueva licencia cargada',
    audienceLabel: 'Administradores',
    source: 'Empleado',
    destination: 'Destinatarios administrativos',
    triggerLabel: 'Licencia creada',
    description: 'Avisa que una licencia nueva requiere atención.',
  },
  employee_license_status_changed: {
    label: 'Cambio de estado de licencia',
    audienceLabel: 'Empleados',
    source: 'Sistema',
    destination: 'Empleado involucrado',
    triggerLabel: 'Estado actualizado',
    description: 'Comunica una decisión o cambio sobre una licencia.',
  },
  employee_document_signed: {
    label: 'Confirmación de firma',
    audienceLabel: 'Empleados',
    source: 'Sistema',
    destination: 'Empleado firmante',
    triggerLabel: 'Documento firmado',
    description: 'Confirma al empleado que su firma quedó registrada.',
  },
  admin_document_signed: {
    label: 'Notificación de firma',
    audienceLabel: 'Administradores',
    source: 'Empleado',
    destination: 'Destinatarios administrativos',
    triggerLabel: 'Documento firmado',
    description: 'Informa al equipo administrativo sobre una firma.',
  },
  employee_terms_reminder: {
    label: 'Recordatorio de términos',
    audienceLabel: 'Empleados',
    source: 'Sistema',
    destination: 'Empleados pendientes',
    triggerLabel: 'Aceptación pendiente',
    description: 'Recuerda aceptar la versión vigente de los términos.',
  },
  admin_daily_report: {
    label: 'Reporte matutino',
    audienceLabel: 'Administradores',
    source: 'Sistema · 09:00',
    destination: 'Destinatarios administrativos',
    triggerLabel: 'Resumen diario',
    description: 'Entrega el resumen elegido para comenzar el día.',
  },
  employee_daily_reminder: {
    label: 'Recordatorio diario',
    audienceLabel: 'Empleados',
    source: 'Sistema',
    destination: 'Empleados con pendientes',
    triggerLabel: 'Pendientes diarios',
    description: 'Señala tareas pendientes que requieren seguimiento.',
  },
  employee_document_assigned: {
    label: 'Documento nuevo asignado',
    audienceLabel: 'Empleados',
    source: 'Administrador',
    destination: 'Empleado asignado',
    triggerLabel: 'Documento asignado',
    description: 'Avisa que hay un documento nuevo para revisar.',
  },
  requester_document_manual: {
    label: 'Envío manual de documento',
    audienceLabel: 'Solicitante',
    source: 'Usuario que solicita',
    destination: 'Solicitante',
    triggerLabel: 'Envío manual',
    description:
      'Mantiene separado el envío puntual solicitado por una persona.',
  },
};

export const REPORT_SECTION_PRESENTATION: Record<
  TCompanyReportSectionCode,
  { label: string; description: string }
> = {
  statistical_summary: {
    label: 'Resumen estadístico',
    description: 'Una lectura rápida de la actividad de la empresa.',
  },
  employees_on_leave_today: {
    label: 'Empleados con licencia hoy',
    description: 'Quiénes tienen una licencia activa durante el día.',
  },
  pending_licenses: {
    label: 'Licencias pendientes de aprobación',
    description: 'Solicitudes que todavía necesitan una decisión.',
  },
  unsigned_documents: {
    label: 'Documentos sin firmar',
    description: 'Documentos que aún esperan una firma.',
  },
  pending_terms_acceptance: {
    label: 'Términos pendientes',
    description: 'Personas que todavía no aceptaron la versión vigente.',
  },
  upcoming_vacations: {
    label: 'Vacaciones próximas',
    description: 'Ausencias planificadas que se acercan.',
  },
  expiring_licenses: {
    label: 'Licencias próximas a vencer',
    description: 'Licencias que requieren atención por vencimiento.',
  },
};

export const toSafePreviewText = (value: string | null | undefined): string => {
  if (!value) return '';
  if (typeof DOMParser === 'undefined') {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const document = new DOMParser().parseFromString(value, 'text/html');
  return document.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
};
