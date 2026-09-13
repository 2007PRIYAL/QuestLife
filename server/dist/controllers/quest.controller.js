"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complete = exports.remove = exports.update = exports.getOne = exports.list = exports.create = void 0;
const quest_schema_1 = require("../schemas/quest.schema");
const quest_service_1 = require("../services/quest.service");
const create = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const input = quest_schema_1.createQuestSchema.parse(req.body);
        const quest = await (0, quest_service_1.createQuest)(req.user.userId, input);
        res.status(201).json({
            success: true,
            data: quest,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const list = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const quests = await (0, quest_service_1.getQuests)(req.user.userId);
        res.status(200).json({
            success: true,
            data: quests,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.list = list;
const getOne = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const questId = String(req.params.id);
        if (!questId || questId === 'undefined') {
            res.status(400).json({
                success: false,
                message: 'Quest ID is required',
            });
            return;
        }
        const quest = await (0, quest_service_1.getQuestById)(req.user.userId, questId);
        res.status(200).json({
            success: true,
            data: quest,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const questId = String(req.params.id);
        if (!questId || questId === 'undefined') {
            res.status(400).json({
                success: false,
                message: 'Quest ID is required',
            });
            return;
        }
        const input = quest_schema_1.updateQuestSchema.parse(req.body);
        const quest = await (0, quest_service_1.updateQuest)(req.user.userId, questId, input);
        res.status(200).json({
            success: true,
            data: quest,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const questId = String(req.params.id);
        if (!questId || questId === 'undefined') {
            res.status(400).json({
                success: false,
                message: 'Quest ID is required',
            });
            return;
        }
        const result = await (0, quest_service_1.deleteQuest)(req.user.userId, questId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
const complete = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const questId = String(req.params.id);
        if (!questId || questId === 'undefined') {
            res.status(400).json({
                success: false,
                message: 'Quest ID is required',
            });
            return;
        }
        const result = await (0, quest_service_1.completeQuest)(req.user.userId, questId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }
        next(error);
    }
};
exports.complete = complete;
