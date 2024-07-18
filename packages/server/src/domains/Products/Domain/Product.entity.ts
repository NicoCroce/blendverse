export class Product {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _stock: number;

  constructor(id: string, name: string, description: string, stock: number) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._stock = stock;
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._stock,
      name: this._name,
      description: this._description,
      stock: this._stock,
    };
  }
}
