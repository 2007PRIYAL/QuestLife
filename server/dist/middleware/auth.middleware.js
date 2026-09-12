"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const token = authHeader.slice(7).trim();
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
        };
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
exports.authenticate = authenticate;
