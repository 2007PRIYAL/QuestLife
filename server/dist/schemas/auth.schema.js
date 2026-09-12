"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const isValidTimeZone = (timezone) => {
    try {
        Intl.DateTimeFormat(undefined, {
            timeZone: timezone,
        });
        return true;
    }
    catch {
        return false;
    }
};
exports.registerSchema = zod_1.z
    .object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(8).max(128),
    username: zod_1.z
        .string()
        .min(3)
        .max(30)
        .regex(/^[A-Za-z0-9_-]+$/, 'Username may contain only letters, numbers, underscores and hyphens'),
    timezone: zod_1.z
        .string()
        .max(64)
        .refine(isValidTimeZone, {
        message: 'Invalid IANA timezone identifier (e.g. UTC, Asia/Kolkata, America/New_York)',
    })
        .optional(),
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(1).max(128),
})
    .strict();
exports.updateProfileSchema = zod_1.z
    .object({
    avatar_url: zod_1.z.string().max(255).optional(),
    equipped_frame: zod_1.z.string().max(64).optional(),
    timezone: zod_1.z
        .string()
        .max(64)
        .refine(isValidTimeZone, {
        message: 'Invalid IANA timezone identifier (e.g. UTC, Asia/Kolkata, America/New_York)',
    })
        .optional(),
})
    .strict();
