import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Container, Button, EmptyState, Text } from '@app/Application';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface RecipientsSectionProps {
  recipients: readonly { email: string }[];
  recipientDraft: string;
  recipientError?: string;
  validationError?: string;
  hasActiveAdminDelivery: boolean;
  onRecipientDraftChange: (value: string) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (email: string) => void;
}

export const RecipientsSection = ({
  recipients,
  recipientDraft,
  recipientError,
  validationError,
  hasActiveAdminDelivery,
  onRecipientDraftChange,
  onAddRecipient,
  onRemoveRecipient,
}: RecipientsSectionProps) => (
  <section className="ces-panel p-4 md:p-6" aria-labelledby="recipients-title">
    <Container space="medium">
      <Container row justify="between" align="end" space="small">
        <Container space="small">
          <span className="ces-utility ces-status-on text-[11px]">
            02 · Destinatarios administrativos
          </span>
          <h2
            id="recipients-title"
            className="ces-display text-xl font-semibold"
          >
            Quién recibe las alertas sensibles
          </h2>
          <Text.Muted className="ces-muted">
            Estas direcciones reciben los envíos administrativos activos. No
            otorgan acceso a GestDoc.
          </Text.Muted>
        </Container>
        <span className="ces-utility ces-muted text-[10px]">
          {recipients.length} registrados
        </span>
      </Container>

      {recipients.length === 0 ? (
        <EmptyState
          title="Todavía no hay destinatarios administrativos"
          description={
            hasActiveAdminDelivery
              ? 'Agrega uno antes de guardar una ruta administrativa activa.'
              : 'Puedes agregarlos ahora o mantener todas las rutas administrativas inactivas.'
          }
          action={{
            label: 'Agregar destinatario',
            onClick: () => document.getElementById('recipient-email')?.focus(),
          }}
        />
      ) : (
        <Container row className="flex-wrap" space="small">
          {recipients.map(({ email }) => (
            <Container
              key={email}
              row
              align="center"
              space="small"
              className="ces-inset min-h-11 px-3 py-2"
            >
              <span className="text-sm text-[var(--ces-ice-100)]">{email}</span>
              <Button
                type="button"
                variant="ghost"
                className="h-7 w-7 p-0 text-[var(--ces-slate-400)] hover:text-[var(--ces-amber-400)]"
                onClick={() => onRemoveRecipient(email)}
                aria-label={`Quitar destinatario ${email}`}
              >
                <FontAwesomeIcon icon={faXmark} />
              </Button>
            </Container>
          ))}
        </Container>
      )}

      <Container className="border-t border-white/10 pt-4" space="small">
        <label
          htmlFor="recipient-email"
          className="ces-utility ces-muted text-[10px]"
        >
          Nueva dirección
        </label>
        <Container
          row
          align="start"
          className="flex-wrap sm:flex-nowrap"
          space="small"
        >
          <input
            id="recipient-email"
            type="email"
            value={recipientDraft}
            onChange={(event) => onRecipientDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAddRecipient();
              }
            }}
            placeholder="admin@empresa.com"
            className="h-control min-w-0 flex-1 rounded-md border border-white/15 bg-[var(--ces-ink-950)] px-3 text-sm text-[var(--ces-ice-100)] placeholder:text-[var(--ces-slate-400)]"
            aria-invalid={Boolean(recipientError)}
            aria-describedby={recipientError ? 'recipient-error' : undefined}
          />
          <Button type="button" icon={faPlus} showIcon onClick={onAddRecipient}>
            Agregar destinatario
          </Button>
        </Container>
        {(recipientError || validationError) && (
          <span
            id="recipient-error"
            className="text-sm text-[var(--ces-amber-400)]"
            role="alert"
          >
            {recipientError ?? validationError}
          </span>
        )}
      </Container>
    </Container>
  </section>
);
