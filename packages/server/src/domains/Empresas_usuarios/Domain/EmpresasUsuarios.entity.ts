import { IEmpresaUsuario } from './EmpresasUsuarios.types';

export class EmpresaUsuario {
  constructor(
    protected readonly _id_empresa: number,
    protected readonly _id_usuario: number,
    protected readonly _id?: number,
    protected readonly _denominacion?: string,
    protected readonly _logo?: string | null,
  ) {}

  static create(props: IEmpresaUsuario): EmpresaUsuario {
    return new EmpresaUsuario(
      props.id_empresa,
      props.id_usuario,
      props.id,
      props.denominacion,
      props.logo,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_empresa: this._id_empresa,
      id_usuario: this._id_usuario,
      denominacion: this._denominacion,
      logo: this._logo,
    };
  }
}
