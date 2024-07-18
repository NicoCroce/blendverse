import { createTRPCReact } from '@trpc/react-query';
import { TUserRouter } from '@blendverse/server/src/domains/Users';

export const TrpcProducts = createTRPCReact<TUserRouter>();
