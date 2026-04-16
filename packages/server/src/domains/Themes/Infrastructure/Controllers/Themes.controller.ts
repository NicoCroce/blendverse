import { protectedProcedure } from '@server/Infrastructure';
import { ThemesService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class ThemesController {
  constructor(private themesService: ThemesService) {}

  getAllThemes = () =>
    protectedProcedure
      .input(
        z
          .object({
            nombre: z.string().default(''),
          })
          .optional(),
      )
      .query(
        executeService(
          this.themesService.getAllThemes.bind(this.themesService),
        ),
      );

  getTheme = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID es requerida'))
      .query(
        executeService(this.themesService.getTheme.bind(this.themesService)),
      );

  createTheme = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          nombre: z.string(),
          color_clase: z.string(),
          texto_clase: z.string(),
          color_primary_hsl: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const response = await this.themesService.createTheme({
          input,
          requestContext: ctx.requestContext,
        });
        return response;
      });

  updateTheme = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number(),
          nombre: z.string(),
          color_clase: z.string(),
          texto_clase: z.string(),
          color_primary_hsl: z.string(),
        }),
      )
      .mutation(
        executeService(this.themesService.updateTheme.bind(this.themesService)),
      );

  deleteTheme = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID es requerida'))
      .mutation(
        executeService(this.themesService.deleteTheme.bind(this.themesService)),
      );
}
