import { MainRouter } from '@app/Domains/Main/MainRoutes';
import { ProductsRouter } from '@app/Domains/Products/ProductsRoutes';
import { UsersRouter } from '@app/Domains/Users/UsersRoutes';

export const AllRoutes = [MainRouter, UsersRouter, ProductsRouter];
