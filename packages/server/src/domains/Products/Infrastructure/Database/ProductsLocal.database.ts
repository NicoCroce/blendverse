import { Products } from '@server/data';
import { delay } from '@server/utils/Utils';

export class ProductsLocalDatabase {
  getProductsList = async () => {
    await delay();
    return Products;
  };

  getProduct = async (id: string) => {
    await delay();
    return Products.find((product) => product.id === id);
  };

  addProduct = async ({
    name,
    description,
    stock,
    price,
  }: {
    name: string;
    description: string;
    stock: number;
    price: number;
  }) => {
    await delay();

    const newProduct = {
      id: String(Products.length),
      name,
      description,
      stock,
      price,
    };

    Products.push(newProduct);

    return newProduct;
  };

  updateStock = async (id: string, stock: number) => {
    await delay();
    const product = Products.find((p) => p.id === id);

    if (!product) return null;

    product.stock = stock;
    return product;
  };

  deleteProduct = async (id: string) => {
    await delay();
    const index = Products.findIndex((p) => p.id === id);
    const deletedProduct = Products[index];
    Products.splice(index, 1);
    return deletedProduct;
  };

  getInfoProduct = async ({
    id,
    params,
  }: {
    id: string;
    params: string | string[];
  }): Promise<Record<string, unknown> | null> => {
    await delay();
    type TResponse = Record<string, unknown> | undefined;

    const product: TResponse = Products.find((p) => p.id === id);
    const response: TResponse = {};

    if (!product) return null;

    if (typeof params === 'string') {
      response[params] = product[params];
    }

    if (Array.isArray(params)) {
      params.forEach((value) => {
        response[value] = product[value];
      });
    }

    return response;
  };
}
