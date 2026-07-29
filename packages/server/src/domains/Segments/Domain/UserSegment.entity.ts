export class UserSegment {
  constructor(
    private readonly _id_usuario: number,
    private readonly _id_segmento: number,
    private readonly _id?: number,
  ) {}

  static create(props: {
    id_usuario: number;
    id_segmento: number;
    id?: number;
  }): UserSegment {
    return new UserSegment(props.id_usuario, props.id_segmento, props.id);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_usuario: this._id_usuario,
      id_segmento: this._id_segmento,
    };
  }
}
