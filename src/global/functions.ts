import pe from 'parse-error';
import { Response } from 'express';
import { MongoError } from 'mongodb';

export const ErrResponse = (
    res: Response,
    err: NodeJS.ErrnoException | string | MongoError,
    code: number,
    status: string | boolean = 'failed'
) => {
    res.statusCode = code;

    let error = {
        status,
        message: typeof err === 'string' ? err : err.message,
    };

    return res.status(code).json(error);
};

export const SucResponse = (
    res: Response,
    message: string,
    data: object | null,
    code: number = 200,
    status: string | boolean = 'successful'
) => {
    let sendData = {
        data,
        status,
        message,
    };

    res.statusCode = code;

    return res.json(sendData);
};

process.on('unhandledRejection', error => {
    console.error('Uncaught Error', pe(error));
});