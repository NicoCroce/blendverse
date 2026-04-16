import { useNavigate } from 'react-router-dom';
import { Text } from '@app/Aplication';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/Aplication/Components/ui/card';
import { Skeleton } from '@/Aplication/Components/ui/skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface StatCardProps {
  title: string;
  value: number | undefined;
  subtitle: string;
  emptySubtitle: string;
  icon: IconDefinition;
  isLoading: boolean;
  to?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  emptySubtitle,
  icon,
  isLoading,
  to,
}: StatCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className={`rounded-2xl shadow-sm p-6 transition-all ${
        to ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
      }`}
      onClick={to ? () => navigate(to) : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <FontAwesomeIcon
          icon={icon}
          className="h-4 w-4 text-muted-foreground"
        />
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <Skeleton className="h-9 w-24 mb-1" />
        ) : (
          <p className="text-3xl font-bold tracking-tight text-primary">
            {value?.toLocaleString('es-AR') ?? '—'}
          </p>
        )}
        <Text.Muted>{value === 0 ? emptySubtitle : subtitle}</Text.Muted>
      </CardContent>
    </Card>
  );
};
