import { protectedProcedure } from '@server/Infrastructure';
import { OwnersyssService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class OwnersyssController {
  constructor(private ownersyssService: OwnersyssService) {}
  getOwnersys = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID is requerida'))
      .query(
        executeService(
          this.ownersyssService.getOwnersys.bind(this.ownersyssService),
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
