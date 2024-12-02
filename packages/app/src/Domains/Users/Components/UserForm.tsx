import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAddUser, useUpdateUser } from '../Hooks';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@app/Aplication/Components/ui/input';
import { Button, Container } from '@app/Aplication/Components';

import { USERS_ROUTE } from '../Users.routes';
import { useEffect, useMemo } from 'react';
import { TUser } from '../User.entity';
import { Combobox } from '@app/Aplication/Components/Organisms';
import { useGetRoleByUser, useGetRoles } from '@app/Domains/Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlink } from '@fortawesome/free-solid-svg-icons';

interface UserFormProps {
  editData?: TUser | null;
}

export const UserForm = ({ editData = null }: UserFormProps) => {
  const { data: rolesOptions } = useGetRoles();
  const { mutate } = useAddUser();
  const { mutate: mutateUpdate } = useUpdateUser();
  const navigate = useNavigate();
  const { data: userRole } = useGetRoleByUser(editData?.id);

  const options = useMemo(() => {
    return rolesOptions?.map((rol) => ({
      value: rol.name,
      label: `${rol.name}`,
    }));
  }, [rolesOptions]);

  const formSchema = z
    .object({
      name: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
      }),
      mail: z.string().min(1, { message: 'Enter an email' }).email({
        message: 'Enter a correct format email',
      }),
      role: z.string().optional(),
      password: !editData
        ? z.string().min(8, {
            message: 'La contraseña debe ser mayor a 8 caracteres',
          })
        : z.string(),
      rePassword: !editData
        ? z.string().min(8, {
            message: 'La contraseña debe ser mayor a 8 caracteres',
          })
        : z.string(),
    })
    .refine(
      (data) => {
        if (!editData) {
          return data.password === data.rePassword;
        }
        return true;
      },
      {
        message: 'Las contraseñas no coinciden',
        path: ['rePassword'],
      },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mail: '',
      role: '',
      password: '',
      rePassword: '',
    },
  });

  useEffect(() => {
    if (!editData) return;

    form.setValue('name', editData?.name);
    form.setValue('mail', editData?.mail);
    form.setValue('role', userRole || '');
  }, [editData, form, userRole]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    if (editData) {
      mutateUpdate({
        id: editData.id!,
        mail: values.mail,
        name: values.name,
        role: values.role || null,
      });
    } else {
      mutate(values);
    }
    navigate(USERS_ROUTE);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleChangeRol = (value: string) => {
    form.setValue('role', value);
  };

  const handleCleanRol = () => {
    form.setValue('role', undefined);
  };

  const { formState } = form;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 m-auto"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de Usuario</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {!formState.errors.name ? (
                <FormDescription>Nombre de usuario a registrar</FormDescription>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
        <FormField
          name="mail"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Usuario</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol de Usuario</FormLabel>
              <FormControl>
                <Container row>
                  <Combobox
                    options={options}
                    value={field.value}
                    onChangeValue={handleChangeRol}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCleanRol}
                  >
                    <FontAwesomeIcon icon={faUnlink}></FontAwesomeIcon>
                  </Button>
                </Container>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!editData && (
          <>
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña de Usuario</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>
                    Ingresse nuevamente la contraseña de Usuario
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Container row justify="end">
          <Button appearance="cancel" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" appearance="save" />
        </Container>
      </form>
    </Form>
  );
};
