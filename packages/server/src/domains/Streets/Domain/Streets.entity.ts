import { IStreet } from './Streets.interfaces';
export class Street {
  constructor(
    private readonly _denominacion: string,
    private readonly _id?: number,
  ) {}

  static create({ denominacion, id }: IStreet): Street {
    return new Street(denominacion, id);
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
