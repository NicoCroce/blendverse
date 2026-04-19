import { Page, Title, Text, Container, useGlobalStore } from '@app/Aplication';
import { TUserLogged, USERS_ROUTE, useGetUsers } from '@app/Domains/Users';
import { StatCard } from '../Components';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

// ── Landing ──────────────────────────────────────────────────────────
export const MainPage = () => {
  const { data: dataUser } = useGlobalStore<TUserLogged>('dataUser');
  const users = useGetUsers();

  return (
    <Page title="Dashboard">
      {/* ── Header de bienvenida ── */}
      <Container className="mb-6">
        <Title variant="h2">
          Bienvenido{dataUser?.name ? `, ${dataUser.name}` : ''} 👋
        </Title>
        <Text.Muted>Resumen general del sistema al día de hoy.</Text.Muted>
      </Container>

      {/* ── Sección de estado ── */}
      <Text.Small className="text-muted-foreground font-medium uppercase tracking-wider mb-2">
        Estado general del sistema
      </Text.Small>

      {/* ── Grid de tarjetas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios"
          value={users.data?.meta?.totalItems}
          subtitle="Total registrados"
          emptySubtitle="Aún no hay usuarios registrados"
          icon={faUsers}
          isLoading={users.isLoading}
          to={USERS_ROUTE}
        />
      </div>

      <Text.Muted className="text-xs text-right mt-4">
        Última actualización: {new Date().toLocaleDateString('es-AR')}
      </Text.Muted>
    </Page>
  );
};
