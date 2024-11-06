import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/Aplication/Components/ui/dialog';

interface ModalProps {
  title: string;
  description: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Modal = ({
  children,
  title,
  description,
  isOpen = false,
  onClose,
}: ModalProps) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
