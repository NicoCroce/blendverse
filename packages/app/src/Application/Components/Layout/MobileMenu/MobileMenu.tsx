import { useState } from 'react';
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
  const { pathname } = useLocation();
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const isOpen = openAtPath === pathname;

  const handleOpenChange = (open: boolean) => {
    setOpenAtPath(open ? pathname : null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <Button
        onClick={() => setOpenAtPath(pathname)}
        className="justify-self-end md:hidden bg-transparent pr-0 pl-2"
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
