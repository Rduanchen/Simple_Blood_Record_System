import jwt from 'jsonwebtoken';
import { type JwtPayload } from 'jsonwebtoken';

const jwtSecretKey = process.env.JWT_SECRET_KEY;

export const generateToken = (content: object): JwtPayload | string => {
  if (jwtSecretKey == null) {
    throw new Error('JWT secret key is not defined');
  }
  return jwt.sign(content, jwtSecretKey);
};

export const decodeToken = (token: string): JwtPayload | string => {
  if (jwtSecretKey == null) {
    throw new Error('JWT secret key is not defined');
  }
  return jwt.verify(token, jwtSecretKey);
};
