import {
  Container,
  FilterButton,
  FiltersSheet,
  useURLParams,
} from '@app/Application';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@app/Application/Components/ui/tabs';
import { useEffect, useState } from 'react';
import {
  PENDING,
  VALIDATED,
  TDocumentSearch,
  TStateDocument,
} from '../../Document.entity';
import { DocumentsList } from './DocumentsList';
import { useViewDocument } from '../../Hooks/useViewDocument';
import { useGetDocumentsTypes } from '../../Hooks/useGetDocumentsTypes';
import { TuseGetDocuments } from '../../Hooks';

import { DocumentsListByUser } from './DocumentsListByUser';
import { TuseGetDocumentsByCompany } from '@app/Domains/Admin/Hooks';
import { FiltersDocumentsForm } from '../FiltersDocumentsForm';

interface DocumentsListWrapperProps {
  service: TuseGetDocuments | TuseGetDocumentsByCompany;
  segmented?: boolean;
  filteredUserIds?: Set<number>;
}

export const DocumentsListWrapper = ({
  service,
  segmented = false,
  filteredUserIds,
}: DocumentsListWrapperProps) => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const isState = (searchParams?.state || PENDING) as TStateDocument;

  const [filtersIsOpen, setFiltersIsOpen] = useState(false);
  useViewDocument();
  useGetDocumentsTypes();

  useEffect(() => {
    if (!searchParams?.state) {
      updateParams({ state: PENDING });
    }
  }, [searchParams?.state, updateParams]);

  const handleTabsChange = (value: string) => {
    updateParams({ state: value, id: undefined });
  };

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <Tabs
        className="w-full flex flex-col gap-4"
        onValueChange={handleTabsChange}
        value={isState}
      >
        <Container row>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={PENDING} className="flex-auto cursor-pointer">
              Pendientes
            </TabsTrigger>
            <TabsTrigger value={VALIDATED} className="flex-auto cursor-pointer">
              Validados
            </TabsTrigger>
          </TabsList>
          <FilterButton
            onClick={handleFilters}
            ignoreParams={['id', 'state']}
          />
        </Container>
        {segmented ? (
          <DocumentsListByUser
            openFilters={handleFilters}
            service={service as TuseGetDocumentsByCompany}
            filteredUserIds={filteredUserIds}
          />
        ) : (
          <DocumentsList
            openFilters={handleFilters}
            service={service as TuseGetDocuments}
          />
        )}
      </Tabs>
      <FiltersSheet
        open={filtersIsOpen}
        closeSheet={handleFilters}
        title="Filtros de Documentos"
      >
        {<FiltersDocumentsForm />}
      </FiltersSheet>
    </>
  );
};
