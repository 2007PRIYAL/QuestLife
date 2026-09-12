import { query } from '../db/pool';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export const registerUser = async (input: RegisterInput) => {
  const passwordHash = await hashPassword(input.password);

  const client = await (await import('../db/pool')).pool.connect();

  try {
    await client.query('BEGIN');

    const existingUser = await client.query(
      `SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1`,
      [input.email.toLowerCase(), input.username],
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email or username already exists');
    }

    const userResult = await client.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`,
      [input.email.toLowerCase(), input.username, passwordHash],
    );

    const user = userResult.rows[0];

    await client.query(
  `INSERT INTO profiles (
    user_id,
    username,
    level,
    current_xp,
    coins,
    health,
    strength,
    intelligence,
    wisdom,
    agility,
    equipped_frame,
    timezone,
    total_quests_completed
  )
  VALUES (
    $1,
    $2,
    1,
    0,
    50,
    10,
    10,
    10,
    10,
    10,
    'frame-wood',
    $3,
    0
  )`,
  [
    user.id,
    input.username,
    input.timezone ?? 'UTC',
  ],
);

    await client.query(
      `INSERT INTO streaks (
        user_id,
        current_streak,
        longest_streak
      )
      VALUES ($1, 0, 0)`,
      [user.id],
    );

    await client.query('COMMIT');

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user,
      token,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async (input: LoginInput) => {
  const result = await query(
    `SELECT id, email, username, password_hash, created_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [input.email.toLowerCase()],
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  const validPassword = await comparePassword(
    input.password,
    user.password_hash,
  );

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
    },
    token,
  };
};

export const getCurrentUser = async (userId: string) => {
  const result = await query(
    `SELECT
      u.id,
      u.email,
      u.username,
      u.created_at,

      p.level,
      p.current_xp,
      p.coins,
      p.health,
      p.strength,
      p.intelligence,
      p.wisdom,
      p.agility,
      p.avatar_url,
      p.equipped_frame,
      p.timezone,
      p.total_quests_completed,

      s.current_streak,
      s.longest_streak,
      s.last_completion_date

     FROM users u
     JOIN profiles p ON p.user_id = u.id
     JOIN streaks s ON s.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const row = result.rows[0];

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    created_at: row.created_at,
    profile: {
      level: row.level,
      current_xp: row.current_xp,
      coins: row.coins,
      health: row.health,
      strength: row.strength,
      intelligence: row.intelligence,
      wisdom: row.wisdom,
      agility: row.agility,
      avatar_url: row.avatar_url,
      equipped_frame: row.equipped_frame,
      timezone: row.timezone,
      total_quests_completed: row.total_quests_completed,
    },
    streak: {
      current_streak: row.current_streak,
      longest_streak: row.longest_streak,
      last_completion_date: row.last_completion_date,
    },
  };
};