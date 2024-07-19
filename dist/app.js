import express from 'express';
import { userRouter } from './route/user-route.js';
import { globalErrorHandler } from './helper/globalErrorHandler.js';
export const app = express();
app.use(express.json());
app.use('/api/v1/user', userRouter);
app.use((err, req, resp, next) => {
    globalErrorHandler(err, resp);
});
