import { AppError } from '@server/Application';

export class UserPassword {
  constructor(readonly value: string) {
    this.validatePassword();
  }

  private validatePassword() {
    if (this.value.length < 8) {
      throw new AppError('Password must be at least 8 characters.');
    }
  }
}
