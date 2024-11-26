import { IRoles } from './Roles.interfaces';

export class Roles {
  constructor(
    private readonly _name: string,
    private readonly _description: string,
    private readonly _permissions: string[],
  ) {}

  static create({ name, description, permissions }: IRoles) {
    return new Roles(name, description, permissions);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      name: this._name,
      description: this._description,
      permissions: this._permissions,
    };
  }
}
