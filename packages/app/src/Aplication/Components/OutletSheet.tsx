import { Outlet, useNavigate } from 'react-router-dom';
import { Sheet } from './ui/sheet';

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
    setTimeout(() => navigate(navigateToOnClose, { state: 'no-animate' }), 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleCloseSheet}>
      <Outlet />
    </Sheet>
  );
};
