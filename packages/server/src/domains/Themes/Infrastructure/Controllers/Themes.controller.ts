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
}
