import { Container } from '@app/Application/Components';
import { Certificate } from './Certificate/Certificate';
import { CertificateActions } from './Certificate/CertificateActions';
import { ICertificate } from '../Certificate.entity';

export interface CertificatesGridProps {
  certificatesList: ICertificate[];
  year: number;
}

export const CertificatesGrid = ({
  certificatesList,
  year,
}: CertificatesGridProps) => {
  return (
    <Container className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 ">
      {certificatesList?.map((certificate) => (
        <div key={certificate.id} className="min-w-0 h-full">
          <Certificate
            data={certificate}
            year={year}
            actions={
              <CertificateActions certificate={certificate} variant="owner" />
            }
          />
        </div>
      ))}
    </Container>
  );
};
