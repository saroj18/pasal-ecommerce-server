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
import dotenv from "dotenv";
import { adminRoute } from "./route/user/admin-route.js";
import { oauthRoute } from "./route/user/oauth-route.js";
import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";
import { mailRoute } from "./route/user/mail-route.js";
import { coupenRoute } from "./route/user/coupen-route.js";
import { Redis } from "ioredis";
dotenv.config();
export const app = express();
export const redis = new Redis({
    host: process.env.REDIS_ORIGIN,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
});
export const server = http.createServer(app);
app.use(express.json());
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
}, function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
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
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/oauth", oauthRoute);
app.use("/api/v1/mail", mailRoute);
app.use("/api/v1/coupen", coupenRoute);
app.use((err, req, resp, next) => {
    globalErrorHandler(err, resp);
});
