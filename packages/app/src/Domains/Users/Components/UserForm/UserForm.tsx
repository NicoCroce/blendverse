import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAddUser, useUpdateUser } from '../../Hooks';
import { z } from 'zod';
import { Form } from '@app/Aplication/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@app/Aplication/Components/ui/input';
import {
  Button,
  Container,
  InputField,
  SelectRoles,
} from '@app/Aplication/Components';
import { USERS_ROUTE } from '../../Users.routes';
import { useEffect } from 'react';
import { TUser } from '../../User.entity';
import { useGetRoleByUser } from '@app/Domains/Auth';
import { formSchemaDefinition } from './userForm.schema';

interface UserFormProps {
  editData?: TUser | null;
}

export const UserForm = ({ editData = null }: UserFormProps) => {
  const { mutate, isSuccess } = useAddUser();
  const { mutate: mutateUpdate } = useUpdateUser();
  const navigate = useNavigate();
  const { data: userRole } = useGetRoleByUser(editData?.id);

  const formSchema = formSchemaDefinition(editData);

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
    if (isSuccess) {
      navigate(USERS_ROUTE);
    }
  }, [isSuccess, navigate]);

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
        <InputField
          name="name"
          control={form.control}
          label="Nombre de Usuario"
        >
          <Input />
        </InputField>

        <InputField control={form.control} name="mail" label="Email de Usuario">
          <Input type="email" />
        </InputField>

        <SelectRoles form={form} name="role" />

        {!editData && (
          <>
            <InputField
              name="password"
              control={form.control}
              label="Contraseña de Usuario"
            >
              <Input type="password" />
            </InputField>
            <InputField
              name="rePassword"
              control={form.control}
              label="Ingresse nuevamente la contraseña de Usuario"
            >
              <Input type="password" />
            </InputField>
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
