import { AuthRouter } from '@app/Domains/Auth';
import { MainRouter } from '@app/Domains/Main';
import { UsersRouter } from '@app/Domains/Users';

export const AllRoutes = [MainRouter, AuthRouter, UsersRouter];
