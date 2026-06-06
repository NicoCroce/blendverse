import { IUser } from './User.types';
export class UserSelect {
  constructor(
    private readonly _nombre: string,
    private readonly _id?: number,
  ) {}

  static create({ name, id }: IUser): UserSelect {
    return new UserSelect(name, id);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      nombre: this._nombre,
    };
  }
}
