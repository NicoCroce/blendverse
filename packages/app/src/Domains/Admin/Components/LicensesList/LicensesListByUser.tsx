import { Container, EmptyState, List, Title } from '@app/Application';
import { ScrollArea } from '@app/Application/Components/ui/scroll-area';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/Application/Components/ui/accordion';
import { TuseGetCertificatesByCompany } from '../../Hooks';
import { Certificate } from '@app/Domains/Certificates/Components';
import { CertificateActions } from '@app/Domains/Certificates/Components/Certificate/CertificateActions';
import { uuid } from '@app/Application/Helpers/uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { LicensesListSkeleton } from './LicensesListSkeleton';

type TServiceData = NonNullable<TuseGetCertificatesByCompany['data']>;

interface DocumentsListProps {
  service: TuseGetCertificatesByCompany;
  filteredData?: TServiceData;
  query?: string;
}

export const LicensesListByUser = ({
  service,
  filteredData,
  query,
}: DocumentsListProps) => {
  const { isLoading } = service;

  if (isLoading) {
    return <LicensesListSkeleton />;
  }

  const dataToIterate: TServiceData | undefined = filteredData ?? service.data;

  return (
    <>
      {dataToIterate ? (
        Object.keys(dataToIterate).length === 0 ? (
          <EmptyState
            icon={faMagnifyingGlass}
            title={`Sin resultados para «${query ?? ''}»`}
            description="Probá con otro término de búsqueda"
          />
        ) : (
          <ScrollArea className="h-[74vh] w-full">
            <List>
              {Object.keys(dataToIterate)?.map((userId, index) => {
                const certificates = dataToIterate[Number(userId)].certificates;

                return (
                  <List.Li key={userId}>
                    <Accordion type="single" collapsible defaultValue="item-0">
                      <AccordionItem value={`item-${index}`}>
                        <Container className="sticky top-0 bg-slate-50 z-10">
                          <AccordionTrigger className="px-4 cursor-pointer">
                            <Container row align="center">
                              <FontAwesomeIcon icon={faUser} />
                              <Title variant="h4" className="text-sm!">
                                {dataToIterate[Number(userId)].user}
                              </Title>
                            </Container>
                          </AccordionTrigger>
                        </Container>
                        <AccordionContent className="px-4">
                          {Object.entries(certificates).map(
                            ([year, certificatesForYear]) => (
                              <Container
                                key={uuid()}
                                className="[&:not(:first-child)]:mt-10"
                              >
                                <Title variant="h4" className="mt-4">
                                  Licencias correspondientes al año {year}
                                </Title>
                                <Container className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,420px))]">
                                  {certificatesForYear.map((cert) => (
                                    <Container block key={cert.id}>
                                      <Certificate
                                        data={cert}
                                        year={Number(year)}
                                        actions={
                                          <CertificateActions
                                            certificate={cert}
                                            variant="admin"
                                          />
                                        }
                                      />
                                    </Container>
                                  ))}
                                </Container>
                              </Container>
                            ),
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </List.Li>
                );
              })}
            </List>
          </ScrollArea>
        )
      ) : null}
    </>
  );
};
