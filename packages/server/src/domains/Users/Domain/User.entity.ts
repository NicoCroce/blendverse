import { UserEmail, UserId, UserName, UserPassword } from './ValueObjects';
import { IUser } from './User.interfaces';

export class User {
  constructor(
    private readonly _mail: UserEmail,
    private readonly _name: UserName,
    private readonly _id?: UserId,
    private readonly _password?: UserPassword,
    private readonly _userImage?: string,
    private readonly _companyLogo?: string,
    private readonly _companyName?: string,
  ) {}

  static create({
    id,
    mail,
    name,
    password,
    userImage,
    companyLogo,
    companyName,
  }: IUser) {
    const userId = id ? new UserId(id) : undefined;
    const userPassword = password ? new UserPassword(password) : undefined;
    return new User(
      new UserEmail(mail),
      new UserName(name),
      userId,
      userPassword,
      userImage,
      companyLogo,
      companyName,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id?.value,
      mail: this._mail.value,
      name: this._name.value,
      userImage: this._userImage,
      companyLogo: this._companyLogo,
      companyName: this._companyName,
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
