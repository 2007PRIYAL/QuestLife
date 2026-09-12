import { z } from 'zod';

const isValidTimeZone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
    });

    return true;
  } catch {
    return false;
  }
};

export const registerSchema = z
  .object({
    email: z.string().email().max(255),

    password: z.string().min(8).max(128),

    username: z
      .string()
      .min(3)
      .max(30)
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Username may contain only letters, numbers, underscores and hyphens',
      ),

    timezone: z
      .string()
      .max(64)
      .refine(isValidTimeZone, {
        message:
          'Invalid IANA timezone identifier (e.g. UTC, Asia/Kolkata, America/New_York)',
      })
      .optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email().max(255),

    password: z.string().min(1).max(128),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    avatar_url: z.string().max(255).optional(),

    equipped_frame: z.string().max(64).optional(),

    timezone: z
      .string()
      .max(64)
      .refine(isValidTimeZone, {
        message:
          'Invalid IANA timezone identifier (e.g. UTC, Asia/Kolkata, America/New_York)',
      })
      .optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;