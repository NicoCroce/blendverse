import { Button } from '../Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '..';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';

import './ConfirmWithPassword.css';
import { Textarea } from '../../ui/textarea';

interface ConfirmWithPasswordProps {
  onConfirm: (password: string, reason: string) => void;
  textDescription: string;
  isLoading: boolean;
  isOpen: boolean;
  onCloseDialog: () => void;
  signType: 'agreement' | 'disagreement';
}

export const ConfirmWithPassword = ({
  onConfirm,
  textDescription,
  isLoading,
  isOpen,
  onCloseDialog,
  signType,
}: ConfirmWithPasswordProps) => {
  const formSchema = z.object({
    password: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
    reason:
      signType === 'disagreement'
        ? z.string({ message: 'Debe ingrasar una descripción' }).min(10, {
            message: 'Debe ingrasar una descripción con más detalle',
          })
        : z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      reason: '',
    },
  });

  const handleSubmit = ({ password, reason }: z.infer<typeof formSchema>) =>
    onConfirm(password, reason);

  const handleClose = () => {
    form.reset();
    onCloseDialog();
  };

  const additionalText =
    signType === 'agreement' ? 'bajo conformidad' : 'sin conformidad';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-4">Firmar documento</DialogTitle>
          <DialogDescription>
            {textDescription} {additionalText}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input.Password {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {signType === 'disagreement' && (
              <FormField
                name="reason"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ingrese una breve descipción explicando el motivo por el cual está firmando sin conformidad"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter className="mt-8">
              <Button
                onClick={handleClose}
                variant="ghost"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Firmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
