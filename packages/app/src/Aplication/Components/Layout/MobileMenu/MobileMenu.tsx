import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavBar } from '../NavBar/NavBar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../ui/button';
import { useLocation } from 'react-router-dom';

import './MobileMenu.css';

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
        variant="ghost"
      >
        <FontAwesomeIcon icon={faBars} size="2x" className="text-primary" />
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
