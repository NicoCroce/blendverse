import { AuthRouter } from '@app/Domains/Auth';
import { MainRouter } from '@app/Domains/Main';
import { UsersRouter } from '@app/Domains/Users';
import { ConfigRouter } from '@app/Domains/Config';

export const AllRoutes = [MainRouter, AuthRouter, UsersRouter, ConfigRouter];
