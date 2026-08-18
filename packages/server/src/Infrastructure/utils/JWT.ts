import jwt, { type SignOptions } from 'jsonwebtoken';
import { logger } from './pino';

type ExpiresIn = NonNullable<SignOptions['expiresIn']>;

const getSecretKey = () => {
  const secretKey = process.env.SECRET_KEY_BACK || '';
  if (!secretKey)
    throw new Error('You must specify SECRET_KEY_BACK in env file');
  return secretKey;
};

export const generateToken = (data: object, expire: ExpiresIn = '30D') =>
  jwt.sign(data, getSecretKey(), { expiresIn: expire });

export const verifyToken = (
  token: string,
): Promise<string | jwt.JwtPayload | undefined> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, getSecretKey(), (err, decoded) => {
      if (err) {
        logger.error(`Token not provided ${err}} - TOKEN: ${token}}`);
        return reject(err);
      }
      resolve(decoded);
    });
  });
