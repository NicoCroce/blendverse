import {
  faArrowRotateLeft,
  faEye,
  faGavel,
  faPen,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Button, Text } from '@app/Application';
import { Textarea } from '@app/Application/Components/ui/textarea';
import { TCompanyEmailSettingsForm } from '../Hooks/useCompanyEmailSettingsPage';
import { toSafePreviewText } from '../CompanyEmailSettings.entity';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface ContentSectionProps {
  activeTab: 'welcome' | 'terms';
  welcomeMessage: string | null | undefined;
  termsContent: string;
  currentTermsVersion?: number;
  publishConfirmation: boolean;
  isPublishing: boolean;
  register: UseFormRegister<TCompanyEmailSettingsForm>;
  setValue: UseFormSetValue<TCompanyEmailSettingsForm>;
  onTabChange: (tab: 'welcome' | 'terms') => void;
  onRequestPublish: () => void;
  onCancelPublish: () => void;
  onConfirmPublish: () => void;
  welcomeError?: string;
  termsError?: string;
}

export const ContentSection = ({
  activeTab,
  welcomeMessage,
  termsContent,
  currentTermsVersion,
  publishConfirmation,
  isPublishing,
  register,
  setValue,
  onTabChange,
  onRequestPublish,
  onCancelPublish,
  onConfirmPublish,
  welcomeError,
  termsError,
}: ContentSectionProps) => {
  const isWelcome = activeTab === 'welcome';
  const preview = toSafePreviewText(isWelcome ? welcomeMessage : termsContent);

  return (
    <section className="ces-panel p-4 md:p-6" aria-labelledby="content-title">
      <Container space="medium">
        <Container space="small">
          <span className="ces-utility ces-status-on text-[11px]">
            04 · Contenido
          </span>
          <h2 id="content-title" className="ces-display text-xl font-semibold">
            Lo que la empresa quiere decir
          </h2>
          <Text.Muted className="ces-muted">
            El mensaje institucional se agrega como preámbulo. Los términos
            legales se publican siempre como una versión separada.
          </Text.Muted>
        </Container>

        <Container row className="w-full border-b border-white/10" space="none">
          <button
            type="button"
            className={`min-h-11 border-b-2 px-3 text-sm font-semibold ${isWelcome ? 'border-[var(--ces-violet-500)] text-[var(--ces-ice-100)]' : 'border-transparent text-[var(--ces-slate-400)]'}`}
            aria-selected={isWelcome}
            onClick={() => onTabChange('welcome')}
          >
            <FontAwesomeIcon icon={faPen} className="mr-2" />
            Mensaje de inicio
          </button>
          <button
            type="button"
            className={`min-h-11 border-b-2 px-3 text-sm font-semibold ${!isWelcome ? 'border-[var(--ces-violet-500)] text-[var(--ces-ice-100)]' : 'border-transparent text-[var(--ces-slate-400)]'}`}
            aria-selected={!isWelcome}
            onClick={() => onTabChange('terms')}
          >
            <FontAwesomeIcon icon={faGavel} className="mr-2" />
            Términos y condiciones
          </button>
        </Container>

        {isWelcome ? (
          <Container space="small">
            <label
              htmlFor="welcome-message"
              className="ces-utility ces-muted text-[10px]"
            >
              Mensaje institucional opcional
            </label>
            <Textarea
              id="welcome-message"
              {...register('welcomeMessage')}
              value={welcomeMessage ?? ''}
              onChange={(event) =>
                setValue('welcomeMessage', event.target.value || null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="Una bienvenida breve para las comunicaciones de tu empresa"
              maxLength={2000}
              className="min-h-36 border-white/15 bg-[var(--ces-ink-950)] text-[var(--ces-ice-100)] placeholder:text-[var(--ces-slate-400)]"
            />
            <Container row justify="between" space="small">
              <Text.Muted className="ces-muted text-xs">
                Se aplica a los ocho emails automáticos compatibles.
              </Text.Muted>
              <span className="ces-utility ces-muted text-[10px]">
                {welcomeMessage?.length ?? 0} / 2.000
              </span>
            </Container>
            {welcomeError && (
              <span
                className="text-sm text-[var(--ces-amber-400)]"
                role="alert"
              >
                {welcomeError}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              icon={faArrowRotateLeft}
              showIcon
              onClick={() =>
                setValue('welcomeMessage', null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              Restaurar mensaje
            </Button>
          </Container>
        ) : (
          <Container space="small">
            <Container row justify="between" space="small">
              <label
                htmlFor="terms-content"
                className="ces-utility ces-muted text-[10px]"
              >
                Borrador legal · versión siguiente
              </label>
              <span className="ces-utility ces-muted text-[10px]">
                Vigente: v{currentTermsVersion ?? '—'}
              </span>
            </Container>
            <Textarea
              id="terms-content"
              {...register('termsContent')}
              className="min-h-56 border-white/15 bg-[var(--ces-ink-950)] text-[var(--ces-ice-100)] placeholder:text-[var(--ces-slate-400)]"
              maxLength={50000}
              placeholder="Escribe el contenido legal que quieres publicar"
            />
            <Container row justify="between" space="small">
              <Text.Muted className="ces-muted text-xs">
                Se sanitiza en el servidor antes de guardarse. La vista previa
                nunca ejecuta el contenido.
              </Text.Muted>
              <span className="ces-utility ces-muted text-[10px]">
                {termsContent.length.toLocaleString()} / 50.000
              </span>
            </Container>
            {termsError && (
              <span
                className="text-sm text-[var(--ces-amber-400)]"
                role="alert"
              >
                {termsError}
              </span>
            )}
            {!publishConfirmation ? (
              <Button
                type="button"
                icon={faUpload}
                showIcon
                onClick={onRequestPublish}
                isLoading={isPublishing}
              >
                Publicar nueva versión
              </Button>
            ) : (
              <Container
                className="ces-risk-surface rounded-lg p-4"
                space="small"
              >
                <Text className="text-sm font-semibold text-[var(--ces-ice-100)]">
                  Esto creará una nueva versión legal.
                </Text>
                <Text.Muted className="ces-risk text-xs">
                  Las personas que aún no la aceptaron deberán hacerlo. La
                  publicación es independiente de “Guardar cambios”.
                </Text.Muted>
                <Container row className="flex-wrap" space="small">
                  <Button
                    type="button"
                    icon={faUpload}
                    showIcon
                    onClick={onConfirmPublish}
                    isLoading={isPublishing}
                  >
                    Confirmar publicación
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancelPublish}
                    disabled={isPublishing}
                  >
                    Cancelar
                  </Button>
                </Container>
              </Container>
            )}
          </Container>
        )}

        <Container className="ces-inset p-4" space="small">
          <Container row align="center" space="small">
            <FontAwesomeIcon icon={faEye} className="ces-status-on" />
            <span className="ces-utility ces-muted text-[10px]">
              Vista previa segura
            </span>
          </Container>
          <div className="ces-preview min-h-20 text-sm leading-6 text-[var(--ces-ice-100)]">
            {preview ||
              'La vista previa aparecerá aquí cuando escribas contenido.'}
          </div>
        </Container>
      </Container>
    </section>
  );
};
