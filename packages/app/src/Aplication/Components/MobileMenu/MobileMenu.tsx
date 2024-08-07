import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavBar } from '../NavBar/NavBar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../Button';

export const MobileMenu = () => {
  const [isOpen, setOpen] = useState(false);

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
