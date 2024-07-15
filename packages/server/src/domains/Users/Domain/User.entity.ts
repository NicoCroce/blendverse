import { UserEmail, UserId, UserName, UserPassword } from './ValueObjects';

export class User {
  private readonly _id: UserId;
  private readonly _mail: UserEmail;
  private readonly _name: UserName;
  private readonly _password: UserPassword;

  constructor(id: string, mail: string, name: string, password: string) {
    this._id = new UserId(id);
    this._mail = new UserEmail(mail);
    this._name = new UserName(name);
    this._password = new UserPassword(password);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id.value,
      mail: this._mail.value,
      name: this._name.value,
      password: this._password.value,
    };
  }
}
