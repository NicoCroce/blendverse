import { protectedProcedure } from '@server/Infrastructure';
import { ProfilesService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';
import { paginationZodParams } from '@server/utils';

export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  getAllProfiles = () =>
    protectedProcedure
      .input(
        z
          .object({
            denominacion: z.string().default(''),
            ...paginationZodParams,
          })
          .optional(),
      )
      .query(
        executeService(
          this.profilesService.getAllProfiles.bind(this.profilesService),
        ),
      );

  getProfile = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID is requerida'))
      .query(
        executeService(
          this.profilesService.getProfile.bind(this.profilesService),
        ),
      );

  getSelectProfile = () =>
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
          this.profilesService.getSelectProfile.bind(this.profilesService),
        ),
      );

  createProfile = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number().optional(),
          denominacion: z.string(),
          visualiza_stock: z.number(),
          prioridad_precio: z.number(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const response = await this.profilesService.createProfile({
          input,
          requestContext: ctx.requestContext,
        });

        return response;
      });

  deleteProfile = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID es requerida'))
      .mutation(
        executeService(
          this.profilesService.deleteProfile.bind(this.profilesService),
        ),
      );

  updateProfile = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          denominacion: z.string(),
          visualiza_stock: z.number(),
          prioridad_precio: z.number(),
        }),
      )
      .mutation(
        executeService(
          this.profilesService.updateProfile.bind(this.profilesService),
        ),
      );
}
