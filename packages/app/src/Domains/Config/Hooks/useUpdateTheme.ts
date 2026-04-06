import { toast } from 'sonner';
import { OwnserSysService } from '../Config.service';

export const useUpdateTheme = () => {
  const { mutate, isPending } = OwnserSysService.changeTheme.useMutation({
    onSuccess: () => {
      toast.success('Tema actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el tema');
    },
  });

  const update = (tema: number) => {
    mutate(tema);
  };

  return { update, isPending };
};
