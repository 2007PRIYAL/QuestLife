import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

import app from '../src/app';
import { pool } from '../src/db/pool';

describe('Phase 1 Integration Suite', () => {
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let questId: string;

  beforeAll(async () => {
    // Test users are cleaned up before the suite.
    await pool.query(
      `DELETE FROM users WHERE email LIKE 'test_%@liferpg.dev'`,
    );

    const userA = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_user_a@liferpg.dev',
        password: 'Password123!',
        username: 'UserA',
        timezone: 'Asia/Kolkata',
      });

    expect(userA.status).toBe(201);

    userAToken = userA.body.data.token;
    userAId = userA.body.data.user.id;

    const userB = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_user_b@liferpg.dev',
        password: 'Password123!',
        username: 'UserB',
        timezone: 'UTC',
      });

    expect(userB.status).toBe(201);

    userBToken = userB.body.data.token;
  });

  afterAll(async () => {
    await pool.query(
      `DELETE FROM users WHERE email LIKE 'test_%@liferpg.dev'`,
    );

    await pool.end();
  });

  describe('Health API', () => {
    it('GET /health returns 200', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('life-rpg-api');
    });
  });

  describe('Authentication', () => {
    it('returns the authenticated user with complete profile and streak data', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.data.id).toBe(userAId);
      expect(res.body.data.email).toBe('test_user_a@liferpg.dev');
      expect(res.body.data.username).toBe('UserA');

      expect(res.body.data.password_hash).toBeUndefined();

      expect(res.body.data.profile.level).toBe(1);
      expect(res.body.data.profile.current_xp).toBe(0);
      expect(res.body.data.profile.coins).toBe(50);

      expect(res.body.data.profile.health).toBe(10);
      expect(res.body.data.profile.strength).toBe(10);
      expect(res.body.data.profile.intelligence).toBe(10);
      expect(res.body.data.profile.wisdom).toBe(10);
      expect(res.body.data.profile.agility).toBe(10);

      expect(res.body.data.profile.equipped_frame).toBe(
        'frame-wood',
      );

      expect(res.body.data.profile.timezone).toBe('Asia/Kolkata');

      expect(res.body.data.streak.current_streak).toBe(0);
      expect(res.body.data.streak.longest_streak).toBe(0);
      expect(res.body.data.streak.last_completion_date).toBeNull();
    });

    it('rejects access to protected routes without a token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('rejects an invalid JWT', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
    });

    it('authenticates a valid login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_user_a@liferpg.dev',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('rejects an invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test_user_a@liferpg.dev',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
    });

    it('rejects duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test_user_a@liferpg.dev',
          password: 'Password123!',
          username: 'AnotherHero',
        });

      expect(res.status).toBe(500);
    });

    it('rejects invalid timezone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test_timezone@liferpg.dev',
          password: 'Password123!',
          username: 'TimezoneHero',
          timezone: 'Not/ARealTimezone',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Profile API', () => {
    it('retrieves the authenticated profile', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.data.user_id).toBe(userAId);
      expect(res.body.data.level).toBe(1);
      expect(res.body.data.coins).toBe(50);
      expect(res.body.data.health).toBe(10);
      expect(res.body.data.current_streak).toBe(0);
    });

    it('allows cosmetic profile updates', async () => {
      const res = await request(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          timezone: 'America/New_York',
          equipped_frame: 'frame-gold',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.timezone).toBe(
        'America/New_York',
      );
      expect(res.body.data.equipped_frame).toBe(
        'frame-gold',
      );
    });

    it('rejects attempts to modify server-authoritative stats', async () => {
      const res = await request(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          level: 99,
          coins: 999999,
          current_xp: 999999,
          health: 999,
        });

      expect(res.status).toBe(400);
    });

    it('rejects invalid profile timezone', async () => {
      const res = await request(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          timezone: 'Invalid/Timezone',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Quest CRUD API', () => {
    it('creates a quest owned by the authenticated user', async () => {
      const res = await request(app)
        .post('/api/quests')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Master PostgreSQL',
          description: 'Learn PostgreSQL transactions',
          type: 'MAIN',
          category: 'INTELLIGENCE',
          map_index: 1,
          is_recurring: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      expect(res.body.data.title).toBe(
        'Master PostgreSQL',
      );
      expect(res.body.data.type).toBe('MAIN');
      expect(res.body.data.category).toBe(
        'INTELLIGENCE',
      );
      expect(res.body.data.user_id).toBe(userAId);

      questId = res.body.data.id;
    });

    it('lists only the authenticated user quests', async () => {
      const userARes = await request(app)
        .get('/api/quests')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(userARes.status).toBe(200);
      expect(userARes.body.success).toBe(true);
      expect(
        userARes.body.data.some(
          (quest: { id: string }) => quest.id === questId,
        ),
      ).toBe(true);

      const userBRes = await request(app)
        .get('/api/quests')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(userBRes.status).toBe(200);
      expect(
        userBRes.body.data.some(
          (quest: { id: string }) => quest.id === questId,
        ),
      ).toBe(false);
    });

    it('prevents another user from reading the quest', async () => {
      const res = await request(app)
        .get(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(500);
    });

    it('allows the owner to update the quest', async () => {
      const res = await request(app)
        .patch(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Master PostgreSQL Transactions',
          type: 'SIDE',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe(
        'Master PostgreSQL Transactions',
      );
      expect(res.body.data.type).toBe('SIDE');
    });

    it('prevents another user from updating the quest', async () => {
      const res = await request(app)
        .patch(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hijacked Quest',
        });

      expect(res.status).toBe(500);
    });

    it('prevents another user from deleting the quest', async () => {
      const res = await request(app)
        .delete(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(500);
    });

    it('allows the owner to delete the quest', async () => {
      const res = await request(app)
        .delete(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(questId);
    });

    it('returns 500 for a quest that no longer exists', async () => {
      const res = await request(app)
        .get(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(500);
    });
  });
});