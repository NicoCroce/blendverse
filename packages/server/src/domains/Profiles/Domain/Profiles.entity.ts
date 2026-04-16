import { IProfile } from './Profiles.interfaces';

export class Profile {
  constructor(
    private readonly _id_propietario: number,
    private readonly _denominacion: string,
    private readonly _visualiza_stock: number,
    private readonly _prioridad_precio: number,
    private readonly _id?: number,
  ) {}

  static create({
    id_propietario,
    denominacion,
    visualiza_stock,
    prioridad_precio,
    id,
  }: IProfile): Profile {
    return new Profile(
      id_propietario,
      denominacion,
      visualiza_stock,
      prioridad_precio,
      id,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_propietario: this._id_propietario,
      denominacion: this._denominacion,
      visualiza_stock: this._visualiza_stock,
      prioridad_precio: this._prioridad_precio,
    };
  }
}
