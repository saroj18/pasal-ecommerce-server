var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncHandler } from "../utils/AsyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "./user-controller.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Shop } from "../model/shop-details-model.js";
export const loginWithGoogle = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.user.emails[0].value;
    const username = req.user.displayName;
    const findUser = yield User.findOne({ email });
    const fullname = req.user._json.name;
    if (!findUser) {
        const saveOnDb = yield User.create({
            username,
            email,
            role: "customer",
            fullname,
            signUpAs: "customer",
            password: "login_from_google",
        });
        if (!saveOnDb) {
            throw new ApiError("Failed to save on db");
        }
        const { accessToken, refreshToken } = yield generateAccessTokenAndRefreshToken(findUser._id);
        saveOnDb.refreshToken = refreshToken;
        yield saveOnDb.save();
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        };
        resp.cookie("accessToken", accessToken, options);
        resp.cookie("refreshToken", refreshToken, options);
        resp.redirect(process.env.AFTER_GOOGLE_LOGIN_URL);
        return;
    }
    if (findUser === null || findUser === void 0 ? void 0 : findUser.block) {
        throw new ApiError("You are blocked by Admin");
    }
    findUser.role = "customer";
    yield findUser.save();
    const { accessToken, refreshToken } = yield generateAccessTokenAndRefreshToken(findUser._id);
    const user = yield User.findByIdAndUpdate(findUser._id, { refreshToken });
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    };
    if (user && user.shopVerify) {
        const shop = yield Shop.findOne({ owner: findUser._id });
        if (!shop) {
            throw new ApiError("shop not found");
        }
        resp.cookie("shopId", shop._id, options);
    }
    resp.cookie("accessToken", accessToken, options);
    resp.cookie("refreshToken", refreshToken, options);
    resp.redirect(process.env.AFTER_GOOGLE_LOGIN_URL);
    return;
}));
