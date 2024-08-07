import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { MobileMenu } from '../MobileMenu/MobileMenu';

export const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const backButtonIsVisible = pathname.slice(1).split('/').length > 1;
  const handleBack = () => navigate(-1);

  return (
    <header className="header grid grid-cols-2 content-center justify-between px-4">
      <span>
        {backButtonIsVisible && (
          <Button onClick={handleBack} variant="outline">
            <FontAwesomeIcon icon={faArrowLeft} size="1x" />
          </Button>
        )}
      </span>
      {!backButtonIsVisible && <MobileMenu />}
    </header>
  );
};
