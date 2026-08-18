import { EmptyScreenError, EmptyScreenFilter, List } from '@app/Application';
import { TuseGetDocuments } from '../../Hooks/useGetDocuments';
import { Document } from '../Document';
import { ScrollArea } from '@app/Application/Components/ui/scroll-area';
import { DocumentsListSkeleton } from './DocumentsListSkeleton';

interface DocumentsListProps {
  openFilters: () => void;
  service: TuseGetDocuments;
}

export const DocumentsList = ({ openFilters, service }: DocumentsListProps) => {
  const { data, isLoading, isError, error } = service;

  if (isError) {
    return <EmptyScreenError message={error?.message} />;
  }

  if (isLoading) {
    return <DocumentsListSkeleton />;
  }

  if (!data?.length) return <EmptyScreenFilter onClick={openFilters} />;

  return (
    <ScrollArea className="h-[74vh] w-full">
      <List>
        {data?.map((document) => (
          <List.Li key={document.id}>
            <Document {...document} />
          </List.Li>
        ))}
      </List>
    </ScrollArea>
  );
};
