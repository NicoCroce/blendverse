import { protectedProcedure } from '@server/Infrastructure';
import { ProductsService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class ProductController {
  constructor(private productsService: ProductsService) {}

  getProducts = protectedProcedure.query(
    executeService(this.productsService.getAllProducts),
  );

  getProduct = protectedProcedure
    .input(z.string().min(1, 'ID is required'))
    .query(executeService(this.productsService.getProduct));

  getStock = protectedProcedure
    .input(z.string().min(1, 'ID id required'))
    .query(executeService(this.productsService.getStock));

  createProduct = protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        stock: z.number(),
        price: z.number(),
      }),
    )
    .mutation(executeService(this.productsService.createProduct));

  deleteProduct = protectedProcedure
    .input(z.string())
    .mutation(executeService(this.productsService.deleteProduct));

  updateStock = protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'ID Is required'),
        stock: z.number().gte(0, 'Stock must be at least 0'),
      }),
    )
    .mutation(executeService(this.productsService.updateStock));

  getSomeInfoProduct = protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1, 'ID Requerido de tipo string'),
        params: z.union([z.string(), z.array(z.string())]),
      }),
    )
    .query(executeService(this.productsService.getSomeInfoProduct));

  getTest = protectedProcedure
    .input(z.string())
    .mutation(executeService(this.productsService.getTest));
}
