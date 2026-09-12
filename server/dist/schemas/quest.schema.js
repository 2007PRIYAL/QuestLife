"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestSchema = exports.createQuestSchema = exports.questCategorySchema = exports.questTypeSchema = void 0;
const zod_1 = require("zod");
exports.questTypeSchema = zod_1.z.enum(['MAIN', 'SIDE', 'MINI']);
exports.questCategorySchema = zod_1.z.enum([
    'HEALTH',
    'STRENGTH',
    'INTELLIGENCE',
    'WISDOM',
    'AGILITY',
]);
exports.createQuestSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(120),
    description: zod_1.z.string().max(2000).optional(),
    type: exports.questTypeSchema,
    category: exports.questCategorySchema,
    map_index: zod_1.z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional(),
    is_recurring: zod_1.z.boolean().optional(),
})
    .strict();
exports.updateQuestSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(120).optional(),
    description: zod_1.z.string().max(2000).optional(),
    type: exports.questTypeSchema.optional(),
    category: exports.questCategorySchema.optional(),
    map_index: zod_1.z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional(),
    is_recurring: zod_1.z.boolean().optional(),
})
    .strict();
