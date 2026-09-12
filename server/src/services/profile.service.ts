import { query } from '../db/pool';
import { ProfileUpdateInput } from '../schemas/profile.schema';

export const getProfile = async (userId: string) => {
  const result = await query(
    `SELECT
      p.user_id,
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
     FROM profiles p
     JOIN streaks s ON s.user_id = p.user_id
     WHERE p.user_id = $1
     LIMIT 1`,
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error('Profile not found');
  }

  return result.rows[0];
};

export const updateProfile = async (
  userId: string,
  input: ProfileUpdateInput,
) => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.avatar_url !== undefined) {
    fields.push(`avatar_url = $${values.length + 1}`);
    values.push(input.avatar_url);
  }

  if (input.equipped_frame !== undefined) {
    fields.push(`equipped_frame = $${values.length + 1}`);
    values.push(input.equipped_frame);
  }

  if (input.timezone !== undefined) {
    fields.push(`timezone = $${values.length + 1}`);
    values.push(input.timezone);
  }

  if (fields.length === 0) {
    return getProfile(userId);
  }

  values.push(userId);

  const result = await query(
    `UPDATE profiles
     SET ${fields.join(', ')}
     WHERE user_id = $${values.length}
     RETURNING
       user_id,
       level,
       current_xp,
       coins,
       health,
       strength,
       intelligence,
       wisdom,
       agility,
       avatar_url,
       equipped_frame,
       timezone,
       total_quests_completed`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Profile not found');
  }

  return result.rows[0];
};