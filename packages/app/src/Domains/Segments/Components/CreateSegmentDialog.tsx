import { useState } from 'react';
import { toast } from 'sonner';
import { Container, Button } from '@app/Application';
import { Input } from '@app/Application/Components/ui/input';
import { Label } from '@app/Application/Components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@app/Application/Components/ui/dialog';
import { useCreateSegmentType } from '../Application/segments.queries';

export const CreateSegmentDialog = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const createMutation = useCreateSegmentType();

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { nombre: newName.trim() },
      {
        onSuccess: () => {
          toast.success(`Segmento «${newName.trim()}» creado`);
          setNewName('');
          setCreateOpen(false);
        },
        onError: (err) => {
          toast.error(err.message ?? 'Error al crear el segmento');
        },
      },
    );
  };

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        <Button>Nuevo segmento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear segmento</DialogTitle>
        </DialogHeader>
        <Container space="small">
          <Label htmlFor="create-name">Nombre</Label>
          <Input
            id="create-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Contabilidad"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </Container>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={!newName.trim() || createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
