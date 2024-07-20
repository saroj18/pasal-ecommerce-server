import express from 'express';
import { userRouter } from './route/user/customer-route.js';
import { globalErrorHandler } from './helper/globalErrorHandler.js';
import cors from 'cors';
import { productRouter } from './route/user/product-route.js';
import cookieParser from 'cookie-parser';
export const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(cookieParser());
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use((err, req, resp, next) => {
    globalErrorHandler(err, resp);
});
