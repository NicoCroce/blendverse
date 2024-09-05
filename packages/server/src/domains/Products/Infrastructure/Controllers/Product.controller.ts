import { protectedProcedure } from '@server/Infrastructure';
import { ProductsService } from '../../Application';
import { executeService, executeServiceAlone } from '@server/Application';
import z from 'zod';

export class ProductsController {
  constructor(private productsService: ProductsService) {}

  getProducts = protectedProcedure.query(
    executeServiceAlone(
      this.productsService.getAllProducts.bind(this.productsService),
    ),
  );

  getProduct = protectedProcedure
    .input(z.string().min(1, 'ID is required'))
    .query(
      executeService(
        this.productsService.getProduct.bind(this.productsService),
      ),
    );

  getStock = protectedProcedure
    .input(z.string().min(1, 'ID id required'))
    .query(
      executeService(this.productsService.getStock.bind(this.productsService)),
    );

  createProduct = protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        stock: z.number(),
        price: z.number(),
      }),
    )
    .mutation(
      executeService(
        this.productsService.createProduct.bind(this.productsService),
      ),
    );

  deleteProduct = protectedProcedure
    .input(z.string())
    .mutation(
      executeService(
        this.productsService.deleteProduct.bind(this.productsService),
      ),
    );

  updateStock = protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'ID Is required'),
        stock: z.number().gte(0, 'Stock must be at least 0'),
      }),
    )
    .mutation(
      executeService(
        this.productsService.updateStock.bind(this.productsService),
      ),
    );

  getSomeInfoProduct = protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1, 'ID Requerido de tipo string'),
        params: z.union([z.string(), z.array(z.string())]),
      }),
    )
    .query(
      executeService(
        this.productsService.getSomeInfoProduct.bind(this.productsService),
      ),
    );
}
