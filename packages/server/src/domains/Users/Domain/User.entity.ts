import { UserEmail, UserId, UserName, UserPassword } from './ValueObjects';
import { IUser } from './User.interfaces';

export class User {
  private readonly _id?: UserId;
  private readonly _mail: UserEmail;
  private readonly _name: UserName;
  private readonly _password?: UserPassword;

  constructor({ id, mail, name, password }: IUser) {
    if (id) this._id = new UserId(id);
    this._mail = new UserEmail(mail);
    this._name = new UserName(name);
    if (password) this._password = new UserPassword(password);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id?.value,
      mail: this._mail.value,
      name: this._name.value,
    };
  }

  get id() {
    return this._id?.value;
  }

  get password() {
    return this._password?.value || null;
  }

  get mail() {
    return this._mail.value;
  }
}
