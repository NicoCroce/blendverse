import { useEffect } from 'react';
import { useGlobalStore, Container, Title } from '@app/Application';
import { HalfPage } from '@app/Application/Components/Layout';
import { TUserLogged } from '@app/Domains/Users';
import { EmpresaCard } from '../Components';
import { useGetEmpresasByUsuario, useSelectEmpresa } from '../Hooks';
import { LeftContentPage } from '@app/Domains/Auth';
import { TrpcApi } from '@app/Infrastructure/Services/clientApi';

const bg = '/images/login.png';

export const SeleccionarEmpresaPage = () => {
  const { data: dataUser } = useGlobalStore<TUserLogged>('dataUser');
  const { data: empresas = [] } = useGetEmpresasByUsuario(dataUser?.id ?? 0);
  const { mutate: selectEmpresa, isPending } = useSelectEmpresa();
  const utils = TrpcApi.useUtils();

  useEffect(() => {
    utils.documents.invalidate();
    utils.certificates.invalidate();
  }, []);

  return (
    <HalfPage
      title="Seleccioná tu empresa"
      left={<LeftContentPage title="GestDoc" subtitle="Macrosistemas" />}
      background={bg}
    >
      <Container block className="mb-4">
        <Title variant="h4" className="text-primary mb-2">
          Bienvenido, {dataUser?.name}
        </Title>
        <p className="text-gray-500">
          Tu usuario tiene acceso a las siguientes empresas
        </p>
      </Container>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(empresas ?? []).map((empresa) => (
          <EmpresaCard
            key={empresa.id}
            empresa={empresa}
            onSelect={(empresaId) =>
              selectEmpresa({
                empresaId,
                companyName: empresa.denominacion,
                companyLogo: empresa.logo,
              })
            }
            isLoading={isPending}
          />
        ))}
      </div>
    </HalfPage>
  );
};
