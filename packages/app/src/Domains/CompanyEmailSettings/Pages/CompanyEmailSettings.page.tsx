import {
  faArrowsRotate,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AlertMessage } from '@app/Application/Components/Organisms/AlertMessage';
import {
  Button,
  Container,
  EmptyScreenError,
  EmptyState,
  Page,
  Text,
  useDevice,
} from '@app/Application';
import { CompanyEmailSettingsSkeleton } from '../Components/CompanyEmailSettingsSkeleton';
import {
  ContentSection,
  DeliveryRouteRail,
  MorningReportSection,
  RecipientsSection,
  SettingsSummary,
} from '../Components';
import { useCompanyEmailSettingsPage } from '../Hooks/useCompanyEmailSettingsPage';
import '../CompanyEmailSettings.css';

export const CompanyEmailSettingsPage = () => {
  const { isMobile } = useDevice();
  const page = useCompanyEmailSettingsPage();
  const { data, isLoading, isError, error } = page.query;

  if (isError) {
    return (
      <Page title="Comunicaciones de la empresa">
        <Container space="medium">
          <EmptyScreenError message={error?.message} />
          <Button
            type="button"
            icon={faArrowsRotate}
            showIcon
            onClick={() => page.query.refetch()}
          >
            Reintentar
          </Button>
        </Container>
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page title="Comunicaciones de la empresa">
        <CompanyEmailSettingsSkeleton />
      </Page>
    );
  }

  if (!data) {
    return (
      <Page title="Comunicaciones de la empresa">
        <EmptyState
          title="No hay configuración disponible"
          description="Recarga para solicitar una snapshot completa de las comunicaciones."
          action={{ label: 'Reintentar', onClick: () => page.query.refetch() }}
        />
      </Page>
    );
  }

  const reportEnabled = page.delivery.some(
    (item) => item.code === 'admin_daily_report' && item.enabled,
  );

  return (
    <Page
      title="Comunicaciones de la empresa"
      headerRight={
        <Button
          type="button"
          icon={faFloppyDisk}
          showIcon
          isLoading={page.isSaving}
          onClick={page.submit}
        >
          Guardar cambios
        </Button>
      }
    >
      <div className="company-email-settings -mx-4 min-h-full bg-[var(--ces-ink-950)] p-4 md:-mx-6 md:p-6">
        <Container className="mx-auto w-full max-w-[1400px]" space="large">
          <Container
            className={
              isMobile
                ? 'w-full'
                : 'grid grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)] items-start gap-6'
            }
            space="large"
          >
            {isMobile ? (
              <SettingsSummary
                snapshot={data}
                activeDeliveryCount={page.activeDeliveryCount}
                recipientCount={page.recipients.length}
                activeReportCount={page.activeReportCount}
                compact
              />
            ) : (
              <aside className="sticky top-4">
                <SettingsSummary
                  snapshot={data}
                  activeDeliveryCount={page.activeDeliveryCount}
                  recipientCount={page.recipients.length}
                  activeReportCount={page.activeReportCount}
                />
              </aside>
            )}

            <Container className="min-w-0" space="large">
              {page.form.formState.isDirty && (
                <Container
                  className="ces-risk-surface rounded-lg p-3"
                  row
                  justify="between"
                  align="center"
                  space="small"
                  role="status"
                >
                  <Container row align="center" space="small">
                    <FontAwesomeIcon icon={faFloppyDisk} className="ces-risk" />
                    <Text className="ces-risk text-sm font-semibold">
                      Hay cambios sin guardar
                    </Text>
                  </Container>
                  <span className="ces-utility ces-risk text-[10px]">
                    La versión vigente es v{page.currentVersion}
                  </span>
                </Container>
              )}

              {page.conflict && (
                <AlertMessage
                  variant="warning"
                  title="La configuración cambió mientras editabas"
                  description="Recarga la versión vigente y revisa tus cambios antes de volver a guardar. No se aplicó una edición parcial."
                  action={{
                    label: 'Recargar configuración',
                    onClick: page.reloadCurrent,
                  }}
                />
              )}

              {page.savedFeedback && (
                <Container
                  className="rounded-lg border border-[var(--ces-violet-500)]/40 bg-[var(--ces-violet-500)]/10 p-3"
                  row
                  align="center"
                  space="small"
                  role="status"
                >
                  <span className="ces-status-on text-sm font-semibold">
                    Cambios guardados
                  </span>
                  <span className="ces-muted text-xs">
                    Versión {page.savedFeedback.version} ·{' '}
                    {page.savedFeedback.at.toLocaleTimeString()}
                  </span>
                </Container>
              )}

              {page.saveError && !page.conflict && (
                <AlertMessage
                  variant="error"
                  title="No se guardaron los cambios"
                  description={page.saveError.message}
                  action={{
                    label: 'Reintentar guardado',
                    onClick: page.submit,
                  }}
                />
              )}

              {page.publishError && (
                <AlertMessage
                  variant="error"
                  title="No se publicó la nueva versión"
                  description={page.publishError.message}
                />
              )}

              <DeliveryRouteRail
                delivery={page.delivery}
                onToggle={page.toggleDelivery}
              />
              <RecipientsSection
                recipients={page.recipients}
                recipientDraft={page.recipientDraft}
                recipientError={page.recipientError}
                validationError={page.validationMessages.recipients}
                hasActiveAdminDelivery={page.hasActiveAdminDelivery}
                onRecipientDraftChange={page.setRecipientDraft}
                onAddRecipient={page.handleAddRecipient}
                onRemoveRecipient={page.handleRemoveRecipient}
              />
              <MorningReportSection
                sections={page.reportSections}
                reportEnabled={reportEnabled}
                validationError={page.validationMessages.reportSections}
                onToggle={page.toggleReportSection}
              />
              <ContentSection
                activeTab={page.contentTab}
                welcomeMessage={page.welcomeMessage}
                termsContent={page.termsContent}
                currentTermsVersion={data.currentTerms?.version}
                publishConfirmation={page.publishConfirmation}
                isPublishing={page.isPublishing}
                register={page.form.register}
                setValue={page.form.setValue}
                onTabChange={page.setContentTab}
                onRequestPublish={page.requestPublishTerms}
                onCancelPublish={page.cancelPublishTerms}
                onConfirmPublish={page.confirmPublishTerms}
                welcomeError={page.validationMessages.welcomeMessage}
                termsError={page.validationMessages.termsContent}
              />
            </Container>
          </Container>
        </Container>
      </div>
    </Page>
  );
};
