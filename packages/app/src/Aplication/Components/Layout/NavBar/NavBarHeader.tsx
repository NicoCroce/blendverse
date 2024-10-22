import { TUser } from '@app/Domains/Users';

import { Container } from '../Container';
import { useGlobalStore } from '@app/Aplication/Hooks';
import { Title, Text } from '../../Molecules';

export const NavBarHeader = () => {
  const { data: dataUser } = useGlobalStore<TUser>('dataUser');
  return (
    <header>
      <Container row className="md:px-4">
        {dataUser?.userImage ? (
          <img
            src={dataUser?.userImage}
            className="rounded-full w-14 h-14 border-2 border-primary"
          />
        ) : (
          <span className="rounded-full w-14 h-14 border-2 border-primary text-center bg-primary text-secondary text-3xl leading-[3rem]">
            {dataUser?.name.charAt(0).toUpperCase()}
          </span>
        )}

        <Container space="none">
          <Title variant="h3">
            <span className="capitalize">{dataUser?.name}</span>
          </Title>
          <Container row space="small" align="end">
            {dataUser?.companyLogo ? (
              <img
                alt={dataUser?.companyName}
                src={dataUser?.companyLogo}
                className="h-6"
              />
            ) : (
              <Text.Muted className="leading-none">
                {dataUser?.companyName}
              </Text.Muted>
            )}
          </Container>
        </Container>
      </Container>
    </header>
  );
};
