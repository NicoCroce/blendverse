//import jwt from 'jsonwebtoken';

import { IncomingHttpHeaders } from 'http';

export const verifyTokenInHeader = (headers: IncomingHttpHeaders) => {
  const token =
    (headers['authorization'] as string)?.replace('Bearer ', '') || '';

  if (!token) {
    console.log('🔴 Token not provided');
    return undefined;
  }

  return token;
};
