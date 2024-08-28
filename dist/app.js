import express from "express";
import { userRouter } from "./route/user/customer-route.js";
import { globalErrorHandler } from "./helper/globalErrorHandler.js";
import cors from "cors";
import { productRouter } from "./route/user/product-route.js";
import cookieParser from "cookie-parser";
import { sellerRoute } from "./route/user/sellerr-route.js";
import { paymentRoute } from "./route/user/payment-route.js";
import { orderRoute } from "./route/user/order-route.js";
import { vendorRoute } from "./route/user/vendor-route.js";
import { deleveryPersonRoute } from "./route/user/delevery-person-route.js";
import { reviewRoute } from "./route/user/review-route.js";
import { offerRoute } from "./route/user/offers.route.js";
import http from "http";
import { chatRoute } from "./route/user/chat.route.js";
export const app = express();
export const server = http.createServer(app);
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://pasal-ecommerce-client.vercel.app",
    ],
    credentials: true,
}));
app.use(cookieParser());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/seller", sellerRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/vendor", vendorRoute);
app.use("/api/v1/deleveryperson", deleveryPersonRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/offers", offerRoute);
app.use("/api/v1/chats", chatRoute);
app.use((err, req, resp, next) => {
    globalErrorHandler(err, resp);
});
