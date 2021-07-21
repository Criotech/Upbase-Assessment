"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const functions_1 = require("../global/functions");
const user_model_1 = __importDefault(require("../models/user.model"));
exports.default = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        let tokenString;
        if (token) {
            tokenString = typeof token === 'string' ? token : token[0];
            if (!tokenString) {
                return functions_1.ErrResponse(res, 'Auth failed', 401);
            }
            if (tokenString.startsWith('Bearer ')) {
                // Remove Bearer from string
                tokenString = tokenString.slice(7, tokenString.length);
                const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
                const user = await user_model_1.default.findById(decoded.userId).select('-password');
                if (user) {
                    req.user = user;
                    next();
                }
                else {
                    return functions_1.ErrResponse(res, 'Auth failed', 401);
                }
            }
            else {
                return functions_1.ErrResponse(res, 'Auth failed', 401);
            }
        }
        else {
            return functions_1.ErrResponse(res, 'Auth failed', 401);
        }
    }
    catch (error) {
        if (error.message === 'jwt expired') {
            return res.status(401).json({
                err: `Jwt expired`,
                status: 'failed',
            });
        }
        else {
            return res.status(401).json({
                err: 'Auth failed',
                status: 'failed'
            });
        }
    }
};
