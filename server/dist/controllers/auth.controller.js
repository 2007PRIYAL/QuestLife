"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const auth_schema_1 = require("../schemas/auth.schema");
const auth_service_1 = require("../services/auth.service");
const register = async (req, res, next) => {
    try {
        const input = auth_schema_1.registerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerUser)(input);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const input = auth_schema_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(input);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const user = await (0, auth_service_1.getCurrentUser)(req.user.userId);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
