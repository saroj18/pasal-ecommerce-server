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
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
export const Auth = asyncHandler((req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken } = req.cookies;
    console.log(accessToken);
    if (!accessToken) {
        resp.status(401);
        throw new ApiError("please login first");
    }
    const decodAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRETE);
    console.log("dd", decodAccessToken);
    if (!decodAccessToken) {
        resp.status(401);
        throw new Error("Invalid token");
    }
    const findUser = yield User.findById(decodAccessToken._id);
    if (!findUser) {
        resp.status(404);
        throw new ApiError("User not found");
    }
    console.log("sora", findUser);
    req.user = findUser._id;
    next();
}));
