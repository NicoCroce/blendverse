export class Product {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _stock: number;
  private readonly _price: number;

  constructor(
    id: string,
    name: string,
    description: string,
    stock: number,
    price: number,
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._stock = stock;
    this._price = price;
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      stock: this._stock,
      price: this._price,
    };
  }
}
