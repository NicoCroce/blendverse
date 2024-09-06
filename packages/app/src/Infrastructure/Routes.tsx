import { MainRouter } from '@app/Domains/Main/MainRoutes';
import { ProductsRouter } from '@app/Domains/Products/ProductsRoutes';
import { UsersRouter } from '@app/Domains/Users/UsersRoutes';
import { AuthRoutes } from '@app/Domains/Auth';

export const AllRoutes = [MainRouter, AuthRoutes, UsersRouter, ProductsRouter];
