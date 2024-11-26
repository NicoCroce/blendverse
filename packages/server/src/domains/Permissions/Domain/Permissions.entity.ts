import { IPermissions } from './Permissions.interfaces';

export class Permissions {
  constructor(
    private readonly _name: string,
    private readonly _description: string,
  ) {}

  static create({ name, description }: IPermissions) {
    return new Permissions(name, description);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      name: this._name,
      description: this._description,
    };
  }
}
