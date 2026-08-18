import { ICertificate } from './Certificate.types';
import { CertificateTypes } from './CertificateTypes.entity';

export class Certificate {
  constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private readonly _returnDate: Date,
    private readonly _reason: string,
    private readonly _type: CertificateTypes,
    private readonly _requiresRest: boolean,
    private readonly _status:
      | 'aprobado'
      | 'rechazado'
      | 'pendiente'
      | 'validando'
      | 'eliminado',
    private readonly _files?: string[],
    private readonly _id?: number,
    private readonly _userId?: number,
  ) {}

  static create({
    id,
    startDate,
    endDate,
    returnDate,
    reason,
    type,
    files,
    requiresRest,
    status,
    userId,
  }: ICertificate) {
    if (startDate >= endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    if (endDate >= returnDate) {
      throw new Error(
        'La fecha de fin debe ser anterior a la fecha de reintegro',
      );
    }

    const typeInstance = CertificateTypes.create({
      id: type?.values.id,
      name: type.values.name,
    });
    return new Certificate(
      startDate,
      endDate,
      returnDate,
      reason,
      typeInstance,
      requiresRest ?? false,
      status ?? 'pendiente',
      files,
      id,
      userId,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      startDate: this._startDate,
      endDate: this._endDate,
      returnDate: this._returnDate,
      reason: this._reason,
      type: this._type,
      requiresRest: this._requiresRest,
      status: this._status,
      files: this._files,
    };
  }

  get userId() {
    return this._userId;
  }

  get status() {
    return this._status;
  }

  get id() {
    return this._id;
  }

  assertOwnerCanDelete(): void {
    if (this._status === 'eliminado') {
      throw new Error(
        'No se puede eliminar un certificado que ya fue eliminado',
      );
    }
    if (this._status !== 'pendiente') {
      throw new Error(
        'Solo se pueden eliminar certificados con estado pendiente',
      );
    }
  }

  get type() {
    return this._type.values.name;
  }
}
