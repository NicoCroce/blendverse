import { ITheme } from './Themes.interfaces';

export class Theme {
  constructor(
    private readonly _nombre: string,
    private readonly _color_clase: string,
    private readonly _texto_clase: string,
    private readonly _color_primary_hsl: string,
    private readonly _id?: number,
  ) {}

  static create({
    nombre,
    color_clase,
    texto_clase,
    color_primary_hsl,
    id,
  }: ITheme): Theme {
    return new Theme(nombre, color_clase, texto_clase, color_primary_hsl, id);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      nombre: this._nombre,
      color_clase: this._color_clase,
      texto_clase: this._texto_clase,
      color_primary_hsl: this._color_primary_hsl,
    };
  }
}
