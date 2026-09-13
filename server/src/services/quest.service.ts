import { query, pool } from '../db/pool';
import {
  CreateQuestInput,
  UpdateQuestInput,
} from '../schemas/quest.schema';
import {
  calculateLevelAndCarryOverXp,
  calculateStreak,
  getDateInTimezone,
} from './gamification.service';

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
    `SELECT
       q.*,
       EXISTS (
         SELECT 1
         FROM quest_completions qc
         WHERE qc.quest_id = q.id
           AND qc.completion_date = (NOW() AT TIME ZONE COALESCE(p.timezone, 'UTC'))::DATE
       ) AS completed_today
     FROM quests q
     LEFT JOIN profiles p ON p.user_id = q.user_id
     WHERE q.user_id = $1
     ORDER BY q.map_index ASC NULLS LAST, q.created_at ASC`,
    [userId],
  );

  return result.rows;
};

export const getQuestById = async (
  userId: string,
  questId: string,
) => {
  const result = await query(
    `SELECT
       q.*,
       EXISTS (
         SELECT 1
         FROM quest_completions qc
         WHERE qc.quest_id = q.id
           AND qc.completion_date = (NOW() AT TIME ZONE COALESCE(p.timezone, 'UTC'))::DATE
       ) AS completed_today
     FROM quests q
     LEFT JOIN profiles p ON p.user_id = q.user_id
     WHERE q.id = $1 AND q.user_id = $2
     LIMIT 1`,
    [questId, userId],
  );

  if (result.rows.length === 0) {
    throw new Error('Quest not found');
  }

  return result.rows[0];
};

const ATTR_COLUMN_MAP: Record<string, string> = {
  HEALTH: 'health',
  STRENGTH: 'strength',
  INTELLIGENCE: 'intelligence',
  WISDOM: 'wisdom',
  AGILITY: 'agility',
};

export const completeQuest = async (userId: string, questId: string) => {
  // 1. Get the quest
  const questResult = await query(
    `SELECT * FROM quests WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [questId, userId],
  );

  if (questResult.rows.length === 0) {
    const error = new Error('Quest not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const quest = questResult.rows[0];

  // 2. Get profile and streak
  const profileResult = await query(
    `SELECT
       p.*,
       s.current_streak,
       s.longest_streak,
       s.last_completion_date
     FROM profiles p
     JOIN streaks s ON s.user_id = p.user_id
     WHERE p.user_id = $1
     LIMIT 1`,
    [userId],
  );

  if (profileResult.rows.length === 0) {
    const error = new Error('Profile not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const profile = profileResult.rows[0];
  const userTimezone = profile.timezone || 'UTC';
  const today = getDateInTimezone(userTimezone);

  // 3. Check if already completed today
  const completionCheck = await query(
    `SELECT 1 FROM quest_completions WHERE quest_id = $1 AND completion_date = $2 LIMIT 1`,
    [questId, today],
  );

  if (completionCheck.rows.length > 0) {
    const error = new Error('This quest has already been completed today.') as Error & {
      statusCode?: number;
    };
    error.statusCode = 400;
    throw error;
  }

  // 4. Calculate rewards, carry-over level progression, and stats
  const xpAwarded = Number(quest.base_xp);
  const coinsAwarded = Number(quest.base_coins);
  const attributePointsAwarded = Number(quest.attribute_points);
  const attributeCategory = quest.category;

  const { level: newLevel, currentXp: newCurrentXp, leveledUp } =
    calculateLevelAndCarryOverXp(
      Number(profile.level),
      Number(profile.current_xp),
      xpAwarded,
    );

  const newCoins = Number(profile.coins) + coinsAwarded;
  const newTotalQuests = Number(profile.total_quests_completed) + 1;

  const attrCol = ATTR_COLUMN_MAP[attributeCategory] || 'health';
  const newAttrValue = Number(profile[attrCol] ?? 10) + attributePointsAwarded;

  // 5. Calculate updated streak
  const streakUpdate = calculateStreak(
    profile.last_completion_date,
    Number(profile.current_streak),
    Number(profile.longest_streak),
    today,
  );

  // 6. Execute atomic transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO quest_completions (
         quest_id,
         user_id,
         completion_date,
         xp_awarded,
         coins_awarded,
         attribute_points_awarded,
         attribute_category
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        questId,
        userId,
        today,
        xpAwarded,
        coinsAwarded,
        attributePointsAwarded,
        attributeCategory,
      ],
    );

    await client.query(
      `UPDATE profiles
       SET
         level = $1,
         current_xp = $2,
         coins = $3,
         ${attrCol} = $4,
         total_quests_completed = $5,
         updated_at = NOW()
       WHERE user_id = $6`,
      [
        newLevel,
        newCurrentXp,
        newCoins,
        newAttrValue,
        newTotalQuests,
        userId,
      ],
    );

    await client.query(
      `UPDATE streaks
       SET
         current_streak = $1,
         longest_streak = $2,
         last_completion_date = $3,
         updated_at = NOW()
       WHERE user_id = $4`,
      [
        streakUpdate.currentStreak,
        streakUpdate.longestStreak,
        today,
        userId,
      ],
    );

    await client.query('COMMIT');
  } catch (txError) {
    await client.query('ROLLBACK');
    throw txError;
  } finally {
    client.release();
  }

  return {
    quest: {
      ...quest,
      completed_today: true,
    },
    xp_awarded: xpAwarded,
    coins_awarded: coinsAwarded,
    attribute_points_awarded: attributePointsAwarded,
    attribute_category: attributeCategory,
    leveled_up: leveledUp,
    new_level: newLevel,
    current_streak: streakUpdate.currentStreak,
  };
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
  console.log('QUEST REWARD DEBUG:', REWARDS);

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
