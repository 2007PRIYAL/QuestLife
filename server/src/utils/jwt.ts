import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

const JWT_EXPIRES_IN = '7d';


export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  });

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.email !== 'string' ||
    typeof decoded.username !== 'string'
  ) {
    throw new Error('Invalid JWT payload');
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    username: decoded.username,
  };
};