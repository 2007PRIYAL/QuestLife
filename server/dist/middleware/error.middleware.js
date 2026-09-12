"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (error, _req, res, _next) => {
    console.error(error);
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
            })),
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
