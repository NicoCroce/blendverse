import { IProfile } from './Profiles.interfaces';
export class ProfileSelect {
  constructor(
    private readonly _denominacion: string,
    private readonly _id?: number,
  ) {}

  static create({ denominacion }: IProfile): ProfileSelect {
    return new ProfileSelect(denominacion);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      denominacion: this._denominacion,
    };
  }
}
