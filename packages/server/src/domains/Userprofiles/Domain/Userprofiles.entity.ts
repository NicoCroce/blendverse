import { IUserprofile } from './Userprofiles.interfaces';
export class Userprofile {
  constructor(
    private readonly _id: number | undefined,
    private readonly _id_usuario: number | undefined,
    private readonly _id_perfil: number | undefined,
    private readonly _userName?: string,
    private readonly _profileName?: string,
    private readonly _prioridad_precio?: number,
  ) {}

  static create({
    id_usuario,
    id_perfil,
    id,
    userName,
    profileName,
    prioridad_precio,
  }: IUserprofile): Userprofile {
    return new Userprofile(
      id,
      id_usuario,
      id_perfil,
      userName,
      profileName,
      prioridad_precio,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_usuario: this._id_usuario,
      id_perfil: this._id_perfil,
      userName: this._userName,
      profileName: this._profileName,
      prioridad_precio: this._prioridad_precio,
    };
  }
}
