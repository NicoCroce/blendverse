/**
 * This component is used to load a sheet via navigation, so it uses an Outlet as children.
 * Este componente es utilizado para cargar un sheet mediante navegación, por eso utiliza un Outlet como children.
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { Sheet } from '../ui/sheet';

interface OutletSheetProps {
  open: boolean;
  setIsSheetOpen: (state: boolean) => void;
  navigateToOnClose?: string;
}

export const OutletSheet = ({
  open,
  setIsSheetOpen,
  navigateToOnClose,
}: OutletSheetProps) => {
  const navigate = useNavigate();

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    if (!navigateToOnClose) return;
    setTimeout(() => navigate(navigateToOnClose), 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleCloseSheet}>
      <Outlet />
    </Sheet>
  );
};
