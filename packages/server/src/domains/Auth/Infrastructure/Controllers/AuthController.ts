import { protectedProcedure } from '@server/Infrastructure';

export class AuthController {
  constructor() {}

  login = protectedProcedure.query(async () => {
    console.log('OK');
  });
}
