import { z } from 'zod';

export const questTypeSchema = z.enum(['MAIN', 'SIDE', 'MINI']);

export const questCategorySchema = z.enum([
  'HEALTH',
  'STRENGTH',
  'INTELLIGENCE',
  'WISDOM',
  'AGILITY',
]);

export const createQuestSchema = z
  .object({
    title: z.string().min(1).max(120),

    description: z.string().max(2000).optional(),

    type: questTypeSchema,

    category: questCategorySchema,

    map_index: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional(),

    is_recurring: z.boolean().optional(),
  })
  .strict();

export const updateQuestSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),

    description: z.string().max(2000).optional(),

    type: questTypeSchema.optional(),

    category: questCategorySchema.optional(),

    map_index: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional(),

    is_recurring: z.boolean().optional(),
  })
  .strict();

export type CreateQuestInput = z.infer<typeof createQuestSchema>;
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;