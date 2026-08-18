import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  EMAIL_CATALOG_CODES,
  REPORT_SECTION_CODES,
  TCompanyEmailSettings,
  TCompanyEmailCode,
  TCompanyReportSectionCode,
} from '../CompanyEmailSettings.entity';
import {
  _companyEmailSettingsService,
  CompanyEmailSettingsService,
} from '../CompanyEmailSettings.service';
import { useCompanyEmailSettingsCache } from './useCompanyEmailSettingsCache';
import { useGetCompanyEmailSettings } from './useGetCompanyEmailSettings';

const emailSchema = z
  .string()
  .trim()
  .email('Ingresa una dirección de email válida');

const formSchema = z
  .object({
    delivery: z.array(
      z.object({
        code: z.enum(EMAIL_CATALOG_CODES),
        enabled: z.boolean(),
      }),
    ),
    adminRecipients: z.array(z.object({ email: emailSchema })),
    reportSections: z.array(
      z.object({
        code: z.enum(REPORT_SECTION_CODES),
        enabled: z.boolean(),
      }),
    ),
    welcomeMessage: z.string().nullable(),
    termsContent: z
      .string()
      .max(50000, 'Los términos no pueden superar los 50.000 caracteres'),
  })
  .superRefine((values, context) => {
    const normalizedEmails = values.adminRecipients.map(({ email }) =>
      email.trim().toLowerCase(),
    );
    if (new Set(normalizedEmails).size !== normalizedEmails.length) {
      context.addIssue({
        code: 'custom',
        path: ['adminRecipients'],
        message: 'No se permiten destinatarios duplicados.',
      });
    }

    const hasActiveAdminDelivery = values.delivery.some(
      ({ code, enabled }) =>
        enabled &&
        (code === 'admin_license_created' ||
          code === 'admin_document_signed' ||
          code === 'admin_daily_report'),
    );
    if (hasActiveAdminDelivery && values.adminRecipients.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['adminRecipients'],
        message:
          'Agrega al menos un destinatario o desactiva los envíos administrativos.',
      });
    }

    const reportIsEnabled = values.delivery.some(
      ({ code, enabled }) => code === 'admin_daily_report' && enabled,
    );
    if (
      reportIsEnabled &&
      !values.reportSections.some(({ enabled }) => enabled)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['reportSections'],
        message:
          'Selecciona al menos una sección o desactiva el reporte matutino.',
      });
    }

    if (
      values.welcomeMessage !== null &&
      values.welcomeMessage.trim().length === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['welcomeMessage'],
        message:
          'Usa “Restaurar mensaje” para quitar el mensaje institucional.',
      });
    }
  });

export type TCompanyEmailSettingsForm = z.infer<typeof formSchema>;

const toFormValues = (
  snapshot: TCompanyEmailSettings,
): TCompanyEmailSettingsForm => ({
  delivery: snapshot.deliveries.map(({ code, enabled }) => ({ code, enabled })),
  adminRecipients: snapshot.recipients.map(({ email }) => ({ email })),
  reportSections: snapshot.reportSections.map(({ code, enabled }) => ({
    code,
    enabled,
  })),
  welcomeMessage: snapshot.welcomeMessage,
  termsContent: snapshot.currentTerms?.content ?? '',
});

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error))
    return undefined;
  const data = error.data;
  if (typeof data !== 'object' || data === null || !('code' in data))
    return undefined;
  return typeof data.code === 'string' ? data.code : undefined;
};

const isConflictError = (error: unknown) =>
  getErrorCode(error) === 'CONFLICT' ||
  getErrorCode(error) === 'STALE_CONFIGURATION' ||
  (error instanceof Error && error.message.includes('STALE_CONFIGURATION'));

const getValidationMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return undefined;
  }
  return typeof error.message === 'string' ? error.message : undefined;
};

export const useCompanyEmailSettingsPage = () => {
  const query = useGetCompanyEmailSettings();
  const cache = useCompanyEmailSettingsCache();
  const form = useForm<TCompanyEmailSettingsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delivery: [],
      adminRecipients: [],
      reportSections: [],
      welcomeMessage: null,
      termsContent: '',
    },
    mode: 'onChange',
  });
  const hydratedVersion = useRef<number | undefined>(undefined);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [recipientDraft, setRecipientDraft] = useState('');
  const [recipientError, setRecipientError] = useState<string>();
  const [contentTab, setContentTab] = useState<'welcome' | 'terms'>('welcome');
  const [publishConfirmation, setPublishConfirmation] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<{
    version: number;
    at: Date;
  }>();

  const updateMutation = CompanyEmailSettingsService.update.useMutation({
    onError: (error) => {
      if (!isConflictError(error))
        toast.error(
          'No se guardaron los cambios. Revisa los datos e inténtalo nuevamente.',
        );
    },
  });
  const publishMutation = CompanyEmailSettingsService.publishTerms.useMutation({
    onError: (error) => {
      if (!isConflictError(error))
        toast.error('No se publicó la nueva versión de términos.');
    },
  });
  const watchedDelivery = useWatch({ control: form.control, name: 'delivery' });
  const watchedRecipients = useWatch({
    control: form.control,
    name: 'adminRecipients',
  });
  const watchedReportSections = useWatch({
    control: form.control,
    name: 'reportSections',
  });
  const delivery = useMemo(() => watchedDelivery ?? [], [watchedDelivery]);
  const recipients = useMemo(
    () => watchedRecipients ?? [],
    [watchedRecipients],
  );
  const reportSections = useMemo(
    () => watchedReportSections ?? [],
    [watchedReportSections],
  );
  const welcomeMessage = useWatch({
    control: form.control,
    name: 'welcomeMessage',
  });
  const termsContent =
    useWatch({ control: form.control, name: 'termsContent' }) ?? '';

  const hydrate = useCallback(
    (snapshot: TCompanyEmailSettings) => {
      form.reset(toFormValues(snapshot));
      hydratedVersion.current = snapshot.version;
      setCurrentVersion(snapshot.version);
      setConflict(false);
    },
    [form],
  );

  useEffect(() => {
    if (!query.data) return;
    const shouldHydrate =
      !form.formState.isDirty || hydratedVersion.current !== query.data.version;
    if (shouldHydrate) hydrate(query.data);
  }, [form.formState.isDirty, hydrate, query.data]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  const handleAddRecipient = useCallback(() => {
    const email = recipientDraft.trim();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setRecipientError('Ingresa una dirección de email válida.');
      return;
    }
    if (
      recipients.some(
        (recipient) =>
          recipient.email.trim().toLowerCase() === email.toLowerCase(),
      )
    ) {
      setRecipientError('Ese destinatario ya está en la lista.');
      return;
    }
    form.setValue('adminRecipients', [...recipients, { email }], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setRecipientDraft('');
    setRecipientError(undefined);
  }, [form, recipientDraft, recipients]);

  const handleRemoveRecipient = useCallback(
    (email: string) => {
      form.setValue(
        'adminRecipients',
        recipients.filter((recipient) => recipient.email !== email),
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [form, recipients],
  );

  const toggleDelivery = useCallback(
    (code: TCompanyEmailCode, enabled: boolean) => {
      form.setValue(
        'delivery',
        delivery.map((item) =>
          item.code === code ? { ...item, enabled } : item,
        ),
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [delivery, form],
  );

  const toggleReportSection = useCallback(
    (code: TCompanyReportSectionCode, enabled: boolean) => {
      form.setValue(
        'reportSections',
        reportSections.map((item) =>
          item.code === code ? { ...item, enabled } : item,
        ),
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [form, reportSections],
  );

  const handleSave = useCallback(
    async (values: TCompanyEmailSettingsForm) => {
      if (!currentVersion) return;
      const termsDraft = form.getValues('termsContent');
      const termsDirty = Boolean(form.formState.dirtyFields.termsContent);
      setConflict(false);
      setSavedFeedback(undefined);
      try {
        const snapshot = await updateMutation.mutateAsync({
          expectedVersion: currentVersion,
          delivery: values.delivery,
          adminRecipients: values.adminRecipients,
          reportSections: values.reportSections,
          welcomeMessage: values.welcomeMessage,
        });
        form.reset(toFormValues(snapshot));
        if (termsDirty) {
          form.setValue('termsContent', termsDraft, { shouldDirty: true });
        }
        hydratedVersion.current = snapshot.version;
        setCurrentVersion(snapshot.version);
        setSavedFeedback({ version: snapshot.version, at: new Date() });
        await cache.invalidate();
      } catch (error) {
        if (isConflictError(error)) setConflict(true);
      }
    },
    [cache, currentVersion, form, updateMutation],
  );

  const requestPublishTerms = useCallback(() => {
    setPublishConfirmation(true);
  }, []);

  const cancelPublishTerms = useCallback(() => {
    setPublishConfirmation(false);
  }, []);

  const confirmPublishTerms = useCallback(async () => {
    if (!currentVersion) return;
    setConflict(false);
    try {
      const snapshot = await publishMutation.mutateAsync({
        expectedVersion: currentVersion,
        content: termsContent,
        confirmNewAcceptanceRequirement: true,
      });
      form.reset(toFormValues(snapshot), { keepDirtyValues: true });
      form.resetField('termsContent', {
        defaultValue: snapshot.currentTerms?.content ?? '',
      });
      hydratedVersion.current = snapshot.version;
      setCurrentVersion(snapshot.version);
      setPublishConfirmation(false);
      setSavedFeedback({ version: snapshot.version, at: new Date() });
      await cache.invalidate();
    } catch (error) {
      if (isConflictError(error)) setConflict(true);
    }
  }, [cache, currentVersion, form, publishMutation, termsContent]);

  const reloadCurrent = useCallback(async () => {
    const result = await query.refetch();
    if (result.data) hydrate(result.data);
  }, [hydrate, query]);

  const activeDeliveryCount = useMemo(
    () => delivery.filter((item) => item.enabled).length,
    [delivery],
  );
  const activeReportCount = useMemo(
    () => reportSections.filter((item) => item.enabled).length,
    [reportSections],
  );
  const hasActiveAdminDelivery = delivery.some(
    ({ code, enabled }) =>
      enabled &&
      (code === 'admin_license_created' ||
        code === 'admin_document_signed' ||
        code === 'admin_daily_report'),
  );
  const validationMessages = {
    recipients: getValidationMessage(form.formState.errors.adminRecipients),
    reportSections: getValidationMessage(form.formState.errors.reportSections),
    welcomeMessage: getValidationMessage(form.formState.errors.welcomeMessage),
    termsContent: getValidationMessage(form.formState.errors.termsContent),
  };

  const submit = useCallback(() => {
    void form.handleSubmit(handleSave)();
  }, [form, handleSave]);

  return {
    query,
    form,
    delivery,
    recipients,
    reportSections,
    welcomeMessage,
    termsContent,
    recipientDraft,
    recipientError,
    validationMessages,
    setRecipientDraft,
    handleAddRecipient,
    handleRemoveRecipient,
    toggleDelivery,
    toggleReportSection,
    contentTab,
    setContentTab,
    publishConfirmation,
    requestPublishTerms,
    cancelPublishTerms,
    confirmPublishTerms,
    reloadCurrent,
    conflict,
    savedFeedback,
    activeDeliveryCount,
    activeReportCount,
    hasActiveAdminDelivery,
    isSaving: updateMutation.isPending,
    isPublishing: publishMutation.isPending,
    saveError: updateMutation.error,
    publishError: publishMutation.error,
    submit,
    currentVersion: currentVersion || query.data?.version || 0,
  };
};
