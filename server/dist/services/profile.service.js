"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const pool_1 = require("../db/pool");
const getProfile = async (userId) => {
    const result = await (0, pool_1.query)(`SELECT
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
     LIMIT 1`, [userId]);
    if (result.rows.length === 0) {
        throw new Error('Profile not found');
    }
    return result.rows[0];
};
exports.getProfile = getProfile;
const updateProfile = async (userId, input) => {
    const fields = [];
    const values = [];
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
        return (0, exports.getProfile)(userId);
    }
    values.push(userId);
    const result = await (0, pool_1.query)(`UPDATE profiles
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
       total_quests_completed`, values);
    if (result.rows.length === 0) {
        throw new Error('Profile not found');
    }
    return result.rows[0];
};
exports.updateProfile = updateProfile;
