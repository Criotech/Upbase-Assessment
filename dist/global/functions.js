"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SucResponse = exports.ErrResponse = void 0;
const parse_error_1 = __importDefault(require("parse-error"));
const ErrResponse = (res, err, code, status = 'failed') => {
    res.statusCode = code;
    let error = {
        status,
        message: typeof err === 'string' ? err : err.message,
    };
    return res.status(code).json(error);
};
exports.ErrResponse = ErrResponse;
const SucResponse = (res, message, data, code = 200, status = 'successful') => {
    let sendData = {
        data,
        status,
        message,
    };
    res.statusCode = code;
    return res.json(sendData);
};
exports.SucResponse = SucResponse;
process.on('unhandledRejection', error => {
    console.error('Uncaught Error', parse_error_1.default(error));
});
