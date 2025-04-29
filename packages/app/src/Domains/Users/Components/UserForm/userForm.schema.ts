import { z } from 'zod';
import { TUser } from '../../User.entity';

export const formSchemaDefinition = (editData: TUser | null) =>
  z
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
