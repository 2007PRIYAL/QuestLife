
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createQuestSchema,
  updateQuestSchema,
} from '../schemas/quest.schema';
import {
  createQuest,
  getQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
} from '../services/quest.service';

export const create = async (
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

    const input = createQuestSchema.parse(req.body);

    const quest = await createQuest(
      req.user.userId,
      input,
    );

    res.status(201).json({
      success: true,
      data: quest,
    });
  } catch (error) {
    next(error);
  }
};

export const list = async (
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

    const quests = await getQuests(req.user.userId);

    res.status(200).json({
      success: true,
      data: quests,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
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

    const questId = String(req.params.id);

    if (!questId || questId === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Quest ID is required',
      });
      return;
    }

    const quest = await getQuestById(
      req.user.userId,
      questId,
    );

    res.status(200).json({
      success: true,
      data: quest,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
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

    const questId = String(req.params.id);

    if (!questId || questId === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Quest ID is required',
      });
      return;
    }

    const input = updateQuestSchema.parse(req.body);

    const quest = await updateQuest(
      req.user.userId,
      questId,
      input,
    );

    res.status(200).json({
      success: true,
      data: quest,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
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

    const questId = String(req.params.id);

    if (!questId || questId === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Quest ID is required',
      });
      return;
    }

    const result = await deleteQuest(
      req.user.userId,
      questId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
