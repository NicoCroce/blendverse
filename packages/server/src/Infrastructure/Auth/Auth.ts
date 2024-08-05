import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || '';
if (!secretKey) throw new Error('You must specify SECRET_KEY in dev file');

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.header('Authorization') || '';
  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not provied' });
  }
  try {
    const payload = jwt.verify(token, secretKey);
    console.log(payload);
    //req.username = payload.username;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token not valid' });
  }
};

export const generateToken = (data, expire = '30D') =>
  jwt.sign(data, secretKey, { expiresIn: expire });
