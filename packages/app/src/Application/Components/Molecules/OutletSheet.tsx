/**
 * This component is used to load a sheet via navigation, so it uses an Outlet as children.
 * Este componente es utilizado para cargar un sheet mediante navegación, por eso utiliza un Outlet como children.
 */

import { Outlet, To, useNavigate } from 'react-router-dom';
import { Sheet } from '../ui/sheet';

interface OutletSheetProps {
  open: boolean;
  setIsSheetOpen: (state: boolean) => void;
  navigateToOnClose?: To;
}

export const OutletSheet = ({
  open,
  setIsSheetOpen,
  navigateToOnClose = -1 as To,
}: OutletSheetProps) => {
  const navigate = useNavigate();

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      navigate(navigateToOnClose);
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={handleCloseSheet}>
      <Outlet />
    </Sheet>
  );
};
