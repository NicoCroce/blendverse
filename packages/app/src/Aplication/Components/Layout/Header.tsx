import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { MobileMenu } from './MobileMenu/MobileMenu';
import { Button } from '../ui/button';
import { AccountMenu } from '../Organisms/Menu/AccountMenu';
import { useDevice, useGlobalStore } from '@app/Aplication/Hooks';
import { Container } from './Container';
import img from '@app/Aplication/Images/icon-192x192.png';
import { Title } from '../Molecules';

export const Header = () => {
  const navigate = useNavigate();
  const { isDesktop, isMobile } = useDevice();
  const { data: backButtonIsVisible } =
    useGlobalStore<boolean>('backButtonEnabled');
  const handleBack = () => navigate(-1);

  return (
    <header className="header grid grid-cols-3 content-center justify-between items-center px-4">
      <span>
        {backButtonIsVisible && (
          <Button onClick={handleBack} variant="outline">
            <FontAwesomeIcon icon={faArrowLeft} size="1x" />
          </Button>
        )}
      </span>
      <Container
        row
        align="center"
        justify="center"
        space="small"
        className="relative z-10"
      >
        <img
          src={img}
          width={36}
          className="rounded-full border-2 border-primary"
        />
        <Container space="none">
          <Title variant="h3" className="text-primary">
            GestDoc
          </Title>
        </Container>
      </Container>
      {isDesktop && <AccountMenu />}
      <>{isMobile && <MobileMenu />}</>
    </header>
  );
};
