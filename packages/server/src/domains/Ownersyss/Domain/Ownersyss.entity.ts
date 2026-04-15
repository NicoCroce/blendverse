import { IOwnersys } from './Ownersyss.interfaces';
export class Ownersys {
  constructor(
    private readonly _denominacion: string,
    private readonly _logo: string,
    private readonly _razon_social: string,
    private readonly _cuit: number,
    private readonly _domicilio_fiscal: string,
    private readonly _telefonos_principales: string,
    private readonly _email_corporativo: string,
    private readonly _horarios_atencion: string,
    private readonly _whatsapp: string,
    private readonly _sucursal_pedido: number,
    private readonly _sucursal_presupuestos: number,
    private readonly _id?: number,
    private readonly _tema?: number,
  ) {}

  static create({
    denominacion,
    logo,
    razon_social,
    cuit,
    domicilio_fiscal,
    telefonos_principales,
    email_corporativo,
    horarios_atencion,
    whatsapp,
    sucursal_pedido,
    sucursal_presupuestos,
    id,
    tema,
  }: IOwnersys): Ownersys {
    return new Ownersys(
      denominacion,
      logo,
      razon_social,
      cuit,
      domicilio_fiscal,
      telefonos_principales,
      email_corporativo,
      horarios_atencion,
      whatsapp,
      sucursal_pedido,
      sucursal_presupuestos,
      id,
      tema,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      denominacion: this._denominacion,
      logo: this._logo,
      razon_social: this._razon_social,
      cuit: this._cuit,
      domicilio_fiscal: this._domicilio_fiscal,
      telefonos_principales: this._telefonos_principales,
      email_corporativo: this._email_corporativo,
      horarios_atencion: this._horarios_atencion,
      whatsapp: this._whatsapp,
      sucursal_pedido: this._sucursal_pedido,
      sucursal_presupuestos: this._sucursal_presupuestos,
      tema: this._tema,
    };
  }
}
