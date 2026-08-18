import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Application/Components/ui/sheet';
import { ReactNode } from 'react';

interface IFiltersSheet {
  open: boolean;
  closeSheet: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
}

export const FiltersSheet = ({
  open = false,
  closeSheet,
  children,
  description = 'Puedes filtrar los documentos por los siguientes parámetros',
  title = 'Filtros de Documentos',
}: IFiltersSheet) => {
  return (
    <Sheet defaultOpen={false} open={open} onOpenChange={closeSheet}>
      <SheetContent>
        {description && title && (
          <SheetHeader className="text-left">
            {title && <SheetTitle>{title}</SheetTitle>}
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
        )}
        {children && children}
      </SheetContent>
    </Sheet>
  );
};
