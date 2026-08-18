export interface ICertificateTypes {
  id: number;
  name?: string;
  description?: string;
  rest?: boolean;
}

export class CertificateTypes {
  constructor(
    private readonly id: number,
    private readonly name?: string,
    private readonly description?: string,
    private readonly rest?: boolean,
  ) {}

  static create({ id, name, description, rest }: ICertificateTypes) {
    return new CertificateTypes(id, name, description, rest);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      rest: this.rest,
    };
  }
}
