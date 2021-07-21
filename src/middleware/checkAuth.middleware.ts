const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from 'express';
import { ErrResponse } from '../global/functions';
import UserModel from '../models/user.model';

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization'];
        let tokenString: string;
        if (token) {
            tokenString = typeof token === 'string' ? token : token[0];

            if (!tokenString) {
                return ErrResponse(res, 'Auth failed', 401);
            }

            if (tokenString.startsWith('Bearer ')) {
                // Remove Bearer from string
                tokenString = tokenString.slice(7, tokenString.length);

                const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
                const user = await UserModel.findById(decoded.userId).select(
                    '-password'
                );

                if (user) {
                    req.user = user;
                    next();
                } else {
                    return ErrResponse(res, 'Auth failed', 401);
                }
            } else {
                return ErrResponse(res, 'Auth failed', 401);
            }
        } else {
            return ErrResponse(res, 'Auth failed', 401);
        }
    } catch (error) {
        if (error.message === 'jwt expired') {
            return res.status(401).json({
                err: `Jwt expired`,
                status: 'failed',
            });
        } else {
            return res.status(401).json({
                err: 'Auth failed',
                status: 'failed'
            })
        }
    }
}