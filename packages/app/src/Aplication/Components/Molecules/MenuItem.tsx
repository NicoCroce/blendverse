import { useHasPermission } from '@app/Aplication/Hooks/useHasPermission';
import { Container } from '../Layout';
import {
  NavLink,
  NavLinkRenderProps,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { useEffect } from 'react';

export interface MenuItemProps {
  permission?: string | string[];
  text: string;
  icon?: IconDefinition;
  to: string;
  children?: React.ReactNode;
  redirect?: string;
}

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const MenuItem = ({ permission, ...props }: MenuItemProps) => {
  const { hasPermission } = useHasPermission();

  if (!permission) return <MenuItemElement {...props} />;
  return <>{hasPermission(permission) && <MenuItemElement {...props} />}</>;
};

const MenuItemElement = ({
  icon,
  text,
  to,
  children,
  redirect,
}: Omit<MenuItemProps, 'permission'>) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (redirect && pathname === to) navigate(redirect);
  }, [navigate, pathname, redirect, to]);

  const isActiveLink = ({ isActive }: NavLinkRenderProps): string => {
    return isActive ? styleLink + ' bg-muted text-primary' : styleLink;
  };

  return (
    <>
      <Container space="small" className="flex flex-col gap-2">
        <NavLink to={to} className={isActiveLink}>
          {icon && <FontAwesomeIcon icon={icon} />}
          {text}
        </NavLink>
        {children && (
          <Container space="none" className="pl-7">
            {children}
          </Container>
        )}
      </Container>
    </>
  );
};
