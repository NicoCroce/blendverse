import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { Input } from '@app/Aplication/Components/ui/input';
import { Textarea } from '@app/Aplication/Components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateProduct } from '../Hooks';
import { Button, Container } from '@app/Aplication/Components';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS_ROUTE } from '../ProductsRoutes';
import { v4 as uuid } from 'uuid';

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  stock: z.coerce.number().gt(1, {
    message: 'Stock must be at least 1.',
  }),
  price: z.coerce.number().gt(0, {
    message: 'Username must be at least 0.1.',
  }),
});

export const NewProductForm = () => {
  const { mutate } = useCreateProduct();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: uuid(),
      name: '',
      description: '',
      stock: 0,
      price: 0,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
    toast.success('Producto agregado');
    navigate(PRODUCTS_ROUTE);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 m-auto"
      >
        <FormField
          name="id"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[200px]"
                  placeholder="Ingresa una descripción"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Container row>
          <FormField
            name="stock"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-auto">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="price"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-auto">
                <FormLabel>Precio $</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Container>
        <Container row justify="end">
          <Button variant="cancel" onClick={handleCancel} />
          <Button type="submit" variant="save" />
        </Container>
      </form>
    </Form>
  );
};
