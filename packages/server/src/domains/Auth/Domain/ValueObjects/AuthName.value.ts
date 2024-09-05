import { AppError } from '@server/Application';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class AuthName {
  constructor(readonly value: string) {
    this.ensureValueIsDefined();
    this.ensureEmailFormat();
  }

  private ensureValueIsDefined(): void {
    if (!this.value && typeof this.value !== 'string') {
      throw new AppError('Email must be definend');
    }
  }

  private ensureEmailFormat(): void {
    if (!emailRegex.test(this.value)) {
      throw new AppError('The username must be an email');
    }
  }
}
