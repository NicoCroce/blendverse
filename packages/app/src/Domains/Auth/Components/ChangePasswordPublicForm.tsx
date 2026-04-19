import { Button, Container, Input } from '@app/Aplication';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRenewPasswordAuth } from '../Hooks';
import { useSearchParams } from 'react-router-dom';

const formSchema = z
  .object({
    newPassword: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
    rePassword: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
  })
  .refine((data) => data.newPassword === data.rePassword, {
    message: 'Las contraseñas no coinciden',
    path: ['rePassword'],
  });

interface ChangePasswordFormProps {
  onClose?: () => void;
}

export const ChangePasswordFormPublic = ({
  onClose,
}: ChangePasswordFormProps) => {
  const [searchParams] = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      rePassword: '',
    },
  });

  const { mutate, isSuccess, isPending } = useRenewPasswordAuth();
  const token = searchParams.get('token') || '';

  if (isSuccess) {
    if (onClose) onClose();
    return null;
  }

  const handleSubmit = ({
    newPassword,
    rePassword,
  }: z.infer<typeof formSchema>) => {
    mutate({
      token,
      newPassword,
      rePassword,
    });
  };

  const handleCancel = () => {
    if (onClose) onClose();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña nueva</FormLabel>
              <FormControl>
                <Input.Password {...field} forceEnabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="rePassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingrese nuevamente la contraseña nueva</FormLabel>
              <FormControl>
                <Input.Password {...field} forceEnabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Container row justify="end" className="pt-4">
          {onClose && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" isLoading={isPending} forceEnabled>
            Aceptar
          </Button>
        </Container>
      </form>
    </Form>
  );
};
