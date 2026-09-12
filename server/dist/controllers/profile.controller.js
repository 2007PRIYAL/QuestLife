"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchMyProfile = exports.getMyProfile = void 0;
const profile_schema_1 = require("../schemas/profile.schema");
const profile_service_1 = require("../services/profile.service");
const getMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const profile = await (0, profile_service_1.getProfile)(req.user.userId);
        res.status(200).json({
            success: true,
            data: profile,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyProfile = getMyProfile;
const patchMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const input = profile_schema_1.profileUpdateSchema.parse(req.body);
        const profile = await (0, profile_service_1.updateProfile)(req.user.userId, input);
        res.status(200).json({
            success: true,
            data: profile,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.patchMyProfile = patchMyProfile;
