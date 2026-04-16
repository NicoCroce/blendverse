import { protectedProcedure } from '@server/Infrastructure/trpc';
import { UserprofilesService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';
import { paginationZodParams } from '@server/utils';

export class UserprofilesController {
  constructor(private userprofilesService: UserprofilesService) {}

  getAllUserprofiles = () =>
    protectedProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            ...paginationZodParams,
          })
          .optional(),
      )
      .query(
        executeService(
          this.userprofilesService.getAllUserprofiles.bind(
            this.userprofilesService,
          ),
        ),
      );

  getUserprofile = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID is requerida'))
      .query(
        executeService(
          this.userprofilesService.getUserprofile.bind(
            this.userprofilesService,
          ),
        ),
      );

  createUserprofile = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          id_usuario: z.number(),
          id_perfil: z.number(),
        }),
      )
      .mutation(
        executeService(
          this.userprofilesService.createUserprofile.bind(
            this.userprofilesService,
          ),
        ),
      );

  deleteUserprofile = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID es requerida'))
      .mutation(
        executeService(
          this.userprofilesService.deleteUserprofile.bind(
            this.userprofilesService,
          ),
        ),
      );

  updateUserprofile = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          id_usuario: z.number(),
          id_perfil: z.number(),
        }),
      )
      .mutation(
        executeService(
          this.userprofilesService.updateUserprofile.bind(
            this.userprofilesService,
          ),
        ),
      );

  getProfileByUserId = () =>
    protectedProcedure
      .input(z.number().min(1, 'User ID es requerida'))
      .query(
        executeService(
          this.userprofilesService.getProfileByUserId.bind(
            this.userprofilesService,
          ),
        ),
      );
}
