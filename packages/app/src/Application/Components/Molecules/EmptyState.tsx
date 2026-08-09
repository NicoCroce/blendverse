import { AlertMessage } from '../Organisms/AlertMessage';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconDefinition;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
  };
  children?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  children,
}: EmptyStateProps) => (
  <AlertMessage
    variant="empty"
    title={title}
    description={description}
    icon={icon}
    action={action}
  >
    {children}
  </AlertMessage>
);
