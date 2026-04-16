import { IOwnersys } from './Ownersyss.interfaces';
export class OwnersysSelect {
  constructor(
    private readonly _denominacion: string,
    private readonly _id?: number,
  ) {}

  static create({ denominacion, id }: IOwnersys): OwnersysSelect {
    return new OwnersysSelect(denominacion, id);
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
