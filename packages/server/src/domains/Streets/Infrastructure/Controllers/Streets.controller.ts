import { procedure, protectedProcedure } from '@server/Infrastructure';
import { StreetsService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class StreetsController {
  constructor(private streetsService: StreetsService) {}

  getAllStreets = protectedProcedure
    .input(
      z
        .object({
          denominacion: z.string().default(''),
        })
        .optional(),
    )
    .query(
      executeService(
        this.streetsService.getAllStreets.bind(this.streetsService),
      ),
    );

  getStreet = protectedProcedure
    .input(z.number().min(1, 'ID is requerida'))
    .query(
      executeService(this.streetsService.getStreet.bind(this.streetsService)),
    );

  createStreet = procedure
    .input(
      z.object({
        id: z.number(),
        denominacion: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await this.streetsService.createStreet({
        input,
        requestContext: ctx.requestContext,
      });

      return response;
    });
  deleteStreet = protectedProcedure
    .input(z.number().min(1, 'ID es requerida'))
    .mutation(
      executeService(
        this.streetsService.deleteStreet.bind(this.streetsService),
      ),
    );

  updateStreet = protectedProcedure
    .input(
      z.object({
        id: z.number(),
        denominacion: z.string(),
      }),
    )
    .mutation(
      executeService(
        this.streetsService.updateStreet.bind(this.streetsService),
      ),
    );
}
