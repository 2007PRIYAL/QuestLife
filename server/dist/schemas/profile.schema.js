"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateSchema = void 0;
const zod_1 = require("zod");
exports.profileUpdateSchema = zod_1.z
    .object({
    avatar_url: zod_1.z.string().max(255).optional(),
    equipped_frame: zod_1.z.string().max(64).optional(),
    timezone: zod_1.z.string().max(64).optional(),
})
    .strict();
