import { Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
} from '../schemas/auth.schema';
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);

    const result = await registerUser(input);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};