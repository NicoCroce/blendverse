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
import { Combobox } from '@app/Aplication/Components/Organisms';
import { useGetRoleByUser, useGetRoles } from '@app/Domains/Auth';
import { formSchemaDefinition } from './userForm.schema';
import { SelectField } from '@app/Aplication/Components/Molecules/FormFields/SelectField';

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

        <SelectField
          control={form.control}
          name="role"
          label="Rol de Usuario"
          combobox={
            <Combobox options={options} onChangeValue={handleChangeRol} />
          }
          handleClean={handleCleanRol}
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
