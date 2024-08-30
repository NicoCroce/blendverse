import { AuthName, AuthPassword, AuthToken } from './ValueObjects';

export class Auth {
  private readonly _id: string;
  private readonly _username: AuthName;
  private readonly _password: AuthPassword;
  private readonly _authToken?: AuthToken;

  constructor(id: string, username: string, password: string, token?: string) {
    this._id = id;
    this._username = new AuthName(username);
    this._password = new AuthPassword(password);
    this._authToken = (token && new AuthToken(token)) || undefined;
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

  get token() {
    return this._authToken?.value || null;
  }
}
