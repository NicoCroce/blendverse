import { procedure } from '@server/Infrastructure';
import { ProductsService } from '../../Application';
import z from 'zod';

export class ProductController {
  constructor(private productService: ProductsService) {}

  getProducts = procedure.query(
    async () => await this.productService.getllProducts(),
  );

  getProduct = procedure
    .input(z.string().min(1, 'ID is required'))
    .query(async ({ input }) => await this.productService.getProduct(input));

  getStock = procedure
    .input(z.string().min(1, 'ID id required'))
    .query(async ({ input }) => await this.productService.getStock(input));

  createProduct = procedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        stock: z.number(),
        price: z.number(),
      }),
    )
    .mutation(
      async ({ input: { name, description, stock, price } }) =>
        await this.productService.createProduct(
          name,
          description,
          stock,
          price,
        ),
    );

  deleteProduct = procedure
    .input(z.string())
    .mutation(
      async ({ input: id }) => await this.productService.deleteProduct(id),
    );

  updateStock = procedure
    .input(
      z.object({
        id: z.string().min(1, 'ID Is required'),
        stock: z.number().gte(0, 'Stock must be at least 0'),
      }),
    )
    .mutation(
      async ({ input: { id, stock } }) =>
        await this.productService.updateStock({ id, stock }),
    );

  getSomeInfoProduct = procedure
    .input(
      z.object({
        productId: z.string().min(1, 'ID Requerido de tipo string'),
        params: z.union([z.string(), z.array(z.string())]),
      }),
    )
    .query(
      async ({ input }) => await this.productService.getSomeInfoProduct(input),
    );
}
