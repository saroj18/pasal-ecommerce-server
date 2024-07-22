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
import { errorFormatter } from "../utils/errorFormater.js";
import { UserLoginZodSchema, UserSignUpZodSchema, } from "../zodschema/user/user-signup.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
const generateAccessTokenAndRefreshToken = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield User.findById(id);
    if (!userInfo) {
        throw new ApiError("user not found");
    }
    let accessToken = userInfo === null || userInfo === void 0 ? void 0 : userInfo.generateAccessToken();
    let refreshToken = userInfo === null || userInfo === void 0 ? void 0 : userInfo.generateRefreshToken();
    return { accessToken, refreshToken };
});
export const signUpUser = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fullname, password, email, role, username } = req.body;
    const validateInfo = UserSignUpZodSchema.safeParse({
        fullname,
        password,
        email,
        role,
        username,
    });
    if (validateInfo === null || validateInfo === void 0 ? void 0 : validateInfo.error) {
        const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const findUser = yield User.findOne({ email });
    if (findUser) {
        throw new ApiError("email already register");
    }
    console.log(findUser);
    const saveOnDb = yield User.create({
        username,
        password,
        email,
        role,
        fullname,
    });
    if (!saveOnDb) {
        throw new Error("faild to save on db");
    }
    resp.status(200).json(new ApiResponse("successfully signup", 200, saveOnDb));
}));
export const loginUser = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password, role } = req.body;
    const validateInfo = UserLoginZodSchema.safeParse({ email, password, role });
    if (validateInfo.error) {
        const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const findUser = yield User.findOne({ email });
    if (!findUser) {
        throw new ApiError("User not found");
    }
    const checkPassword = yield findUser.comparePassword(password);
    if (!checkPassword) {
        throw new ApiError("incorrect password");
    }
    findUser.role = role;
    yield findUser.save();
    const { accessToken, refreshToken } = yield generateAccessTokenAndRefreshToken(findUser._id);
    yield User.findByIdAndUpdate(findUser._id, { refreshToken });
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        // sameSite: "none",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    };
    resp.cookie("accessToken", accessToken, options);
    resp.cookie("refreshToken", refreshToken, options);
    resp.status(200).json(new ApiResponse("Login successfully", 200, findUser));
}));
