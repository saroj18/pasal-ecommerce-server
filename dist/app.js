import express from 'express';
import { userRouter } from './route/user/customer-route.js';
import { globalErrorHandler } from './helper/globalErrorHandler.js';
import cors from 'cors';
import { productRouter } from './route/user/product-route.js';
import cookieParser from 'cookie-parser';
import { sellerRoute } from './route/user/sellerr-route.js';
export const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://pasal-ecommerce-server.onrender.com'],
    credentials: true
}));
app.use(cookieParser());
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/seller', sellerRoute);
app.use((err, req, resp, next) => {
    globalErrorHandler(err, resp);
});
