import { z } from 'zod';

export const profileUpdateSchema = z
  .object({
    avatar_url: z.string().max(255).optional(),

    equipped_frame: z.string().max(64).optional(),

    timezone: z.string().max(64).optional(),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;