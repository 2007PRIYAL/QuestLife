"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const pool_1 = require("../db/pool");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const registerUser = async (input) => {
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const client = await (await Promise.resolve().then(() => __importStar(require('../db/pool')))).pool.connect();
    try {
        await client.query('BEGIN');
        const existingUser = await client.query(`SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1`, [input.email.toLowerCase(), input.username]);
        if (existingUser.rows.length > 0) {
            throw new Error('Email or username already exists');
        }
        const userResult = await client.query(`INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`, [input.email.toLowerCase(), input.username, passwordHash]);
        const user = userResult.rows[0];
        await client.query(`INSERT INTO profiles (
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
  )`, [
            user.id,
            input.username,
            input.timezone ?? 'UTC',
        ]);
        await client.query(`INSERT INTO streaks (
        user_id,
        current_streak,
        longest_streak
      )
      VALUES ($1, 0, 0)`, [user.id]);
        await client.query('COMMIT');
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            username: user.username,
        });
        return {
            user,
            token,
        };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const result = await (0, pool_1.query)(`SELECT id, email, username, password_hash, created_at
     FROM users
     WHERE email = $1
     LIMIT 1`, [input.email.toLowerCase()]);
    if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
    }
    const user = result.rows[0];
    const validPassword = await (0, password_1.comparePassword)(input.password, user.password_hash);
    if (!validPassword) {
        throw new Error('Invalid email or password');
    }
    const token = (0, jwt_1.generateToken)({
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
exports.loginUser = loginUser;
const getCurrentUser = async (userId) => {
    const result = await (0, pool_1.query)(`SELECT
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
     LIMIT 1`, [userId]);
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
exports.getCurrentUser = getCurrentUser;
