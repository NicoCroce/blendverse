import { z } from 'zod';

export const formSchemeAddLicense = z
  .object({
    reason: z.string({
      message: 'La razón es obligatoria',
    }),
    type: z.string().min(1, 'Debe seleccionar un tipo de licencia'),
    startDate: z
      .string({
        message: 'La fecha de inicio es obligatoria.',
      })
      .min(1, 'La fecha de inicio es obligatoria'),

    endDate: z
      .string({
        message: 'La fecha de fin es obligatoria',
      })
      .min(1, 'La fecha de fin es obligatoria'),

    returnDate: z
      .string({
        message: 'La fecha de reintegro es obligatoria',
      })
      .min(1, 'La fecha de reintegro es obligatoria'),

    requiresRest: z.boolean().optional(),

    files: z
      .instanceof(FileList)
      .optional()
      .superRefine((val, ctx) => {
        // Solo validar si el campo existe y debería tener archivos
        if (val) {
          // Verificar si hay archivos
          if (val.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Debe seleccionar al menos un archivo',
            });
          }

          // Verificar el tamaño de los archivos (por ejemplo, máximo 5MB cada uno)
          const maxSize = 5 * 1024 * 1024; // 5MB en bytes
          for (let i = 0; i < val.length; i++) {
            if (val[i].size > maxSize) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `El archivo ${val[i].name} supera el tamaño máximo permitido (5MB)`,
              });
            }
          }

          // Verificar tipos de archivo permitidos
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf',
          ];
          for (let i = 0; i < val.length; i++) {
            if (!allowedTypes.includes(val[i].type)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `El archivo ${val[i].name} no es de un tipo permitido. Use JPG, PNG o PDF.`,
              });
            }
          }
        }
      }),
  })
  .superRefine((data, ctx) => {
    // Validar archivos obligatorios según tipo
    if (data.type !== '1' && (!data.files || data.files.length === 0)) {
      ctx.addIssue({
        path: ['files'],
        code: z.ZodIssueCode.custom,
        message: 'Los archivos son obligatorios para este tipo de licencia',
      });
    }

    // Validar que la fecha de fin sea mayor a la de inicio
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const returnDate = new Date(data.returnDate);

    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime())
    ) {
      if (endDate <= startDate) {
        ctx.addIssue({
          path: ['endDate'],
          code: z.ZodIssueCode.custom,
          message: 'La fecha de fin debe ser mayor a la de inicio',
        });
      }
    }

    // Validar que la fecha de reintegro sea al menos 1 día mayor a la de fin
    if (
      !Number.isNaN(endDate.getTime()) &&
      !Number.isNaN(returnDate.getTime())
    ) {
      const minReturnDate = new Date(endDate);
      minReturnDate.setDate(minReturnDate.getDate() + 1);

      if (returnDate < minReturnDate) {
        ctx.addIssue({
          path: ['returnDate'],
          code: z.ZodIssueCode.custom,
          message:
            'La fecha de reintegro debe ser al menos 1 día posterior a la fecha de fin',
        });
      }
    }
  });
