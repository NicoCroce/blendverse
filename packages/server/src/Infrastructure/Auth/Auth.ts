//import jwt from 'jsonwebtoken';

import { IncomingHttpHeaders } from 'http';

const secretKey = process.env.SECRET_KEY || '';
console.log('SECRET', secretKey);
// if (!secretKey) throw new Error('You must specify SECRET_KEY in dev file');

export const verifyToken = (headers: IncomingHttpHeaders) => {
  const auth = (headers['authorization'] as string) || '';
  const token = auth.split(' ')[1];

  if (!token) {
    console.log('🔴 Token not provided');
    return undefined;
  }

  return token;
};

//TODO: Generate token:

/*   try {
    const payload = jwt.verify(token, secretKey);
    console.log(payload);
    //req.username = payload.username;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token not valid' });
  } */

/* export const generateToken = (data, expire = '30D') =>
  jwt.sign(data, secretKey, { expiresIn: expire }); */
