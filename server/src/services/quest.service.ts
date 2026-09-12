import { query } from '../db/pool';
import {
  CreateQuestInput,
  UpdateQuestInput,
} from '../schemas/quest.schema';

const REWARDS = {
  MAIN: {
    base_xp: 100,
    base_coins: 50,
    attribute_points: 3,
  },
  SIDE: {
    base_xp: 60,
    base_coins: 30,
    attribute_points: 2,
  },
  MINI: {
    base_xp: 30,
    base_coins: 10,
    attribute_points: 1,
  },
} as const;

export const createQuest = async (
  userId: string,
  input: CreateQuestInput,
) => {
  const reward = REWARDS[input.type];
  console.log('QUEST DEBUG:', {
  type: input.type,
  reward,
});

  const result = await query(
    `INSERT INTO quests (
      user_id,
      title,
      description,
      type,
      category,
      map_index,
      is_recurring,
      base_xp,
      base_coins,
      attribute_points
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      userId,
      input.title,
      input.description ?? null,
      input.type,
      input.category,
      input.map_index ?? null,
      input.is_recurring ?? false,
      reward.base_xp,
      reward.base_coins,
      reward.attribute_points,
    ],
  );

  return result.rows[0];
};

export const getQuests = async (userId: string) => {
  const result = await query(
    `SELECT *
     FROM quests
     WHERE user_id = $1
     ORDER BY map_index ASC NULLS LAST, created_at ASC`,
    [userId],
  );

  return result.rows;
};

export const getQuestById = async (
  userId: string,
  questId: string,
) => {
  const result = await query(
    `SELECT *
     FROM quests
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [questId, userId],
  );

  if (result.rows.length === 0) {
    throw new Error('Quest not found');
  }

  return result.rows[0];
};

export const updateQuest = async (
  userId: string,
  questId: string,
  input: UpdateQuestInput,
) => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    fields.push(`title = $${values.length + 1}`);
    values.push(input.title);
  }

  if (input.description !== undefined) {
    fields.push(`description = $${values.length + 1}`);
    values.push(input.description);
  }

  if (input.type !== undefined) {
    fields.push(`type = $${values.length + 1}`);
    values.push(input.type);

    const reward = REWARDS[input.type];

    fields.push(`base_xp = $${values.length + 1}`);
    values.push(reward.base_xp);

    fields.push(`base_coins = $${values.length + 1}`);
    values.push(reward.base_coins);

    fields.push(`attribute_points = $${values.length + 1}`);
    values.push(reward.attribute_points);
  }

  if (input.category !== undefined) {
    fields.push(`category = $${values.length + 1}`);
    values.push(input.category);
  }

  if (input.map_index !== undefined) {
    fields.push(`map_index = $${values.length + 1}`);
    values.push(input.map_index);
  }

  if (input.is_recurring !== undefined) {
    fields.push(`is_recurring = $${values.length + 1}`);
    values.push(input.is_recurring);
  }

  if (fields.length === 0) {
    return getQuestById(userId, questId);
  }

  values.push(questId, userId);
  console.log('QUEST REWARD DEBUG:', reward);

  const result = await query(
    `UPDATE quests
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length - 1}
       AND user_id = $${values.length}
     RETURNING *`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Quest not found');
  }

  return result.rows[0];
};

export const deleteQuest = async (
  userId: string,
  questId: string,
) => {
  const result = await query(
    `DELETE FROM quests
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [questId, userId],
  );

  if (result.rows.length === 0) {
    throw new Error('Quest not found');
  }

  return {
    id: result.rows[0].id,
  };
};
