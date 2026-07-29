import { ISegmentType } from './SegmentType.types';

export class SegmentType {
  constructor(
    private readonly _id: number,
    private readonly _nombre: string,
    private readonly _id_propietario: number,
  ) {}

  static create(props: ISegmentType): SegmentType {
    return new SegmentType(props.id, props.nombre, props.id_propietario);
  }

  toJSON() {
    return this.values;
  }

  get values(): ISegmentType {
    return {
      id: this._id,
      nombre: this._nombre,
      id_propietario: this._id_propietario,
    };
  }
}
