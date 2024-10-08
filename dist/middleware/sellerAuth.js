var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessTokenAndRefreshToken } from "../controller/user-controller.js";
import { Shop } from "../model/shop-details-model.js";
export const sellerAuth = (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accessToken, shopId } = req.cookies;
        console.log(accessToken);
        if (!accessToken) {
            resp.status(401);
            throw new ApiError("please provide token first");
        }
        const decodAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRETE);
        if (!decodAccessToken) {
            resp.status(401);
            throw new Error("Invalid token");
        }
        const findUser = yield User.findById(decodAccessToken._id);
        if (!findUser) {
            resp.status(404);
            throw new ApiError("User not found");
        }
        if (!findUser.verify) {
            throw new ApiError("Please verify yourself first!!");
        }
        const shop = yield Shop.findOne({ owner: findUser._id });
        if (!shop) {
            throw new ApiError("shop not found");
        }
        if (!shop.verified) {
            throw new ApiError("Your account is not approve by admin!!");
        }
        if (findUser.role !== "seller") {
            resp.status(401);
            throw new ApiError("unauthorized request");
        }
        req.user = findUser._id;
        req.shopId = shopId;
        req.role = "seller";
        next();
    }
    catch (error) {
        try {
            if (error.name == "TokenExpiredError") {
                const { refreshToken } = req.cookies;
                if (!refreshToken) {
                    throw new Error("please provide refreshToken");
                }
                const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE);
                const findUser = yield User.findById(decode._id);
                if (!findUser) {
                    throw new Error("user not found");
                }
                const { accessToken, refreshToken: refresh } = yield generateAccessTokenAndRefreshToken(findUser._id);
                findUser.refreshToken = refresh;
                yield findUser.save();
                const options = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                    path: "/",
                };
                resp.cookie("accessToken", accessToken, options);
                resp.cookie("refreshToken", refresh, options);
                req.cookies.accessToken = accessToken;
                req.cookies.refreshToken = refresh;
                yield sellerAuth(req, resp, next);
                return;
            }
        }
        catch (err) {
            return resp.status(400).json({ success: false, error: err.message });
        }
        return resp.status(400).json({ success: false, error: error.message });
    }
});
