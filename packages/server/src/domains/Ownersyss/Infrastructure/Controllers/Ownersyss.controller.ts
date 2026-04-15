import { protectedProcedure } from '@server/Infrastructure';
import { OwnersyssService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class OwnersyssController {
  constructor(private ownersyssService: OwnersyssService) {}

  getAllOwnersyss = () =>
    protectedProcedure
      .input(
        z
          .object({
            denominacion: z.string().default(''),
            logo: z.string().default(''),
          })
          .optional(),
      )
      .query(
        executeService(
          this.ownersyssService.getAllOwnersyss.bind(this.ownersyssService),
        ),
      );

  getOwnersys = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID is requerida'))
      .query(
        executeService(
          this.ownersyssService.getOwnersys.bind(this.ownersyssService),
        ),
      );

  getSelectOwnersys = () =>
    protectedProcedure
      .input(
        z
          .object({
            denominacion: z.string().default(''),
          })
          .optional(),
      )
      .query(
        executeService(
          this.ownersyssService.getSelectOwnersys.bind(this.ownersyssService),
        ),
      );

  createOwnersys = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          denominacion: z.string(),
          logo: z.string(),
          razon_social: z.string(),
          cuit: z.number(),
          domicilio_fiscal: z.string(),
          telefonos_principales: z.string(),
          email_corporativo: z.string(),
          horarios_atencion: z.string(),
          whatsapp: z.string(),
          sucursal_pedido: z.number().default(0),
          sucursal_presupuestos: z.number().default(0),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const response = await this.ownersyssService.createOwnersys({
          input,
          requestContext: ctx.requestContext,
        });

        return response;
      });

  deleteOwnersys = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID es requerida'))
      .mutation(
        executeService(
          this.ownersyssService.deleteOwnersys.bind(this.ownersyssService),
        ),
      );

  updateOwnersys = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          denominacion: z.string(),
          logo: z.string(),
          razon_social: z.string(),
          cuit: z.number(),
          domicilio_fiscal: z.string(),
          telefonos_principales: z.string(),
          email_corporativo: z.string(),
          horarios_atencion: z.string(),
          whatsapp: z.string(),
          sucursal_pedido: z.number().default(0),
          sucursal_presupuestos: z.number().default(0),
        }),
      )
      .mutation(
        executeService(
          this.ownersyssService.updateOwnersys.bind(this.ownersyssService),
        ),
      );

  updateTheme = () =>
    protectedProcedure
      .input(z.number())
      .mutation(
        executeService(
          this.ownersyssService.updateTheme.bind(this.ownersyssService),
        ),
      );

  getOwnerTheme = () =>
    protectedProcedure.query(
      executeService(
        this.ownersyssService.getOwnerTheme.bind(this.ownersyssService),
      ),
    );
}
