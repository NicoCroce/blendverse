import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAddUser, useUpdateUser } from '../../Hooks';
import { z } from 'zod';
import { Form } from '@app/Aplication/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@app/Aplication/Components/ui/input';
import { Button, Container, InputField } from '@app/Aplication/Components';
import { USERS_ROUTE } from '../../Users.routes';
import { useEffect, useMemo } from 'react';
import { TUser } from '../../User.entity';
import { useGetRoleByUser, useGetRoles } from '@app/Domains/Auth';
import { formSchemaDefinition } from './userForm.schema';
import { faUnlink } from '@fortawesome/free-solid-svg-icons';
import {
  SelectBase,
  SelectStreet,
} from '@app/Aplication/Components/Molecules/Selects';
import { SelectOther } from '@app/Aplication/Components/Molecules/Selects/Other';

interface UserFormProps {
  editData?: TUser | null;
}

export const UserForm = ({ editData = null }: UserFormProps) => {
  const { data: rolesOptions, isLoading } = useGetRoles();
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

  const formSchema = formSchemaDefinition(editData);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mail: '',
      role: '',
      password: '',
      rePassword: '',
      street: '',
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

        <SelectStreet form={form} name="street" />

        <SelectOther form={form} name="street" />

        <InputField control={form.control} name="mail" label="Email de Usuario">
          <Input type="email" />
        </InputField>

        <SelectBase
          form={form}
          inputLabel="Rol de Usuario"
          name="role"
          options={options}
          enableClean
          isLoading={isLoading}
          handleCleanIcon={faUnlink}
        />

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
