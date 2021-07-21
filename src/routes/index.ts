import { Express } from 'express';
import userRoutes from './user.routes';

export default (app: Express) => {
    app.use('/api', userRoutes);
};