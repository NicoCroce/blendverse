import { AuthName, AuthPassword } from './ValueObjects';

export class Auth {
  private readonly _id: string;
  private readonly _username: AuthName;
  private readonly _password: AuthPassword;

  constructor(id: string, username: string, password: string) {
    this._id = id;
    this._username = new AuthName(username);
    this._password = new AuthPassword(password);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      authName: this._username.value,
      authPassword: this._password.value,
    };
  }
}
