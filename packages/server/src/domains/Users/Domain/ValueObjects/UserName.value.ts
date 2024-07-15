export class UserName {
  constructor(readonly value: string) {
    this.validateUser();
  }

  private validateUser() {
    if (typeof this.value === 'string' && this.value.length < 3) {
      throw new Error('The user name must be at least 4 char');
    }
  }
}
