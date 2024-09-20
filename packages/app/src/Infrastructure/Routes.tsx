import { AuthRouter } from '@app/Domains/Auth';
import { MainRouter } from '@app/Domains/Main';
import { UsersRouter } from '@app/Domains/Users';
import { ProductsRouter } from '@app/Domains/Products';

export const AllRoutes = [MainRouter, AuthRouter, UsersRouter, ProductsRouter];
