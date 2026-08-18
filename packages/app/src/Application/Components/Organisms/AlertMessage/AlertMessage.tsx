import { cva, type VariantProps } from 'class-variance-authority';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTriangleExclamation,
  faCircleInfo,
  faCircleCheck,
  faInbox,
  faMagnifyingGlass,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../Molecules/Button';
import { cn } from '@/Application/lib/utils';
import { Container } from '../..';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center p-4 rounded-xl animate-in fade-in duration-300',
  {
    variants: {
      variant: {
        error: 'bg-destructive/5 border border-destructive/20',
        warning:
          'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30',
        info: 'bg-sky-700/5 border border-sky-700/20',
        success:
          'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30',
        empty: 'bg-muted/50 border border-border',
        search: 'bg-muted/30 border border-dashed border-muted-foreground/30',
      },
    },
    defaultVariants: {
      variant: 'empty',
    },
  },
);

const iconContainerVariants = cva(
  'flex items-center justify-center w-16 h-16 rounded-full',
  {
    variants: {
      variant: {
        error: 'bg-destructive/10 text-destructive',
        warning:
          'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        info: 'bg-sky-700/10 text-sky-700',
        success:
          'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        empty: 'bg-muted text-muted-foreground',
        search: 'bg-muted text-muted-foreground/70',
      },
    },
    defaultVariants: {
      variant: 'empty',
    },
  },
);

const defaultIcons: Record<string, IconDefinition> = {
  error: faTriangleExclamation,
  warning: faTriangleExclamation,
  info: faCircleInfo,
  success: faCircleCheck,
  empty: faInbox,
  search: faMagnifyingGlass,
};

const defaultTitles: Record<string, string> = {
  error: 'Algo salió mal',
  warning: 'Atención',
  info: 'Información',
  success: 'Completado',
  empty: 'Sin resultados',
  search: 'Sin coincidencias',
};

const defaultDescriptions: Record<string, string> = {
  error: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.',
  warning: 'Revisa los datos antes de continuar.',
  info: 'No hay información disponible en este momento.',
  success: 'La operación se completó exitosamente.',
  empty: 'No hay elementos para mostrar.',
  search: 'Prueba ajustando los filtros o cambiando los términos de búsqueda.',
};

interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  title?: string;
  description?: string | null;
  icon?: IconDefinition;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
  };
  className?: string;
  children?: React.ReactNode;
}
export const AlertMessage = ({
  variant = 'empty',
  title,
  description,
  icon,
  action,
  className,
  children,
}: EmptyStateProps) => {
  const displayIcon = icon || defaultIcons[variant || 'empty'];
  const displayTitle = title || defaultTitles[variant || 'empty'];
  const displayDescription =
    description === undefined
      ? defaultDescriptions[variant || 'empty']
      : description;

  return (
    <Container
      space="large"
      row
      justify="start"
      className={cn(emptyStateVariants({ variant }), className)}
    >
      <div className={cn(iconContainerVariants({ variant }))}>
        <FontAwesomeIcon icon={displayIcon} className="w-7 h-7" />
      </div>

      <Container align="start" space="none">
        <h3 className="text-lg font-semibold text-foreground">
          {displayTitle}
        </h3>
        {displayDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displayDescription}
          </p>
        )}

        {action && (
          <Button
            variant={action.variant || 'default'}
            onClick={action.onClick}
            showIcon={false}
            className="p-0 leading-relaxed h-auto mt-2"
          >
            {action.label}
          </Button>
        )}

        {children}
      </Container>
    </Container>
  );
};
