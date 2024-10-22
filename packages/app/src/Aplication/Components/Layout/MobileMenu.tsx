import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavBar } from './NavBar/NavBar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui/button';
import { useLocation } from 'react-router-dom';

export const MobileMenu = () => {
  const [isOpen, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
      <Button
        onClick={() => setOpen(true)}
        className="justify-self-end md:hidden"
        variant="outline"
      >
        <FontAwesomeIcon icon={faBars} size="1x" />
      </Button>

      <SheetContent>
        <SheetHeader>
          <SheetTitle></SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <NavBar />
      </SheetContent>
    </Sheet>
  );
};
