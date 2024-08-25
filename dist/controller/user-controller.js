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
import { UserAddressZodSchema, UserLoginZodSchema, UserSignUpZodSchema, userVerifyZodSchema, } from "../zodschema/user/user-signup.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Address } from "../model/user-address-model.js";
import { Cart } from "../model/cart-model.js";
import jwt from "jsonwebtoken";
import { Order } from "../model/order.model.js";
import { Shop } from "../model/shop-details-model.js";
import { ObjectId } from "mongodb";
export const generateAccessTokenAndRefreshToken = (id) => __awaiter(void 0, void 0, void 0, function* () {
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
        signUpAs: role,
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
    if (findUser === null || findUser === void 0 ? void 0 : findUser.block) {
        throw new ApiError("You are blocked by Admin");
    }
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
    const user = yield User.findByIdAndUpdate(findUser._id, { refreshToken });
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        // sameSite: "none",
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
    resp.status(200).json(new ApiResponse("Login successfully", 200, findUser));
}));
export const userVerify = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { fullname, email, mobile, dob, gender, state, district, city, tole, ward, nearBy, defaultAddress, location, } = req.body;
    if (!email && !fullname) {
        const validateInfo = UserAddressZodSchema.safeParse({
            state,
            city,
            district,
            tole,
            ward,
            nearBy,
            defaultAddress,
            location,
        });
        console.log(validateInfo);
        if (validateInfo.error) {
            const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
            resp.status(400).json({ success: false, error });
            return;
        }
        const createAddress = yield Address.create({
            state,
            city,
            tole,
            district,
            ward,
            nearBy,
            defaultAddress,
            location,
            addressOf: req.user._id,
        });
        if (!createAddress) {
            throw new ApiError("faild to save address");
        }
        resp
            .status(200)
            .json(new ApiResponse("successfully added address", 200, createAddress));
        return;
    }
    const validateInfo = userVerifyZodSchema.safeParse({
        fullname,
        email,
        mobile,
        dob,
        gender,
        state,
        district,
        city,
        tole,
        ward,
        nearBy,
        defaultAddress,
        location,
    });
    if (validateInfo.error) {
        const error = errorFormatter((_b = validateInfo.error) === null || _b === void 0 ? void 0 : _b.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const findUser = yield User.findOne({ email, fullname });
    if (!findUser) {
        throw new ApiError("user not found");
    }
    if (findUser === null || findUser === void 0 ? void 0 : findUser.verify) {
        throw new ApiError("Email already verified");
    }
    const createAddress = yield Address.create({
        state,
        city,
        tole,
        district,
        ward,
        nearBy,
        defaultAddress,
        location,
        addressOf: req.user._id,
    });
    if (!createAddress) {
        throw new ApiError("faild to save address");
    }
    findUser.gender = gender;
    findUser.dob = dob;
    findUser.mobile = mobile;
    findUser.address = createAddress._id;
    findUser.verify = true;
    yield findUser.save();
    resp.status(200).json(new ApiResponse("successfully verify", 200, null));
}));
export const userInfo = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    if (!_id) {
        throw new ApiError("please provide id");
    }
    const findUser = yield User.findById(_id).populate("address");
    if (!findUser) {
        throw new Error("user not found");
    }
    resp.status(200).json(new ApiResponse("", 200, findUser));
}));
export const getAddress = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const findAddress = yield Address.find({ addressOf: _id }).populate("addressOf");
    resp.status(200).json(new ApiResponse("", 200, findAddress));
}));
export const addToCart = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, count } = req.body;
    const { _id } = req.user;
    if (!productId || !_id) {
        throw new ApiError("please provide required info");
    }
    const findOnCart = yield Cart.findOne({ product: productId, addedBy: _id });
    if (findOnCart) {
        throw new ApiError("product already on cart");
    }
    const addOnCart = yield Cart.create({
        product: productId,
        addedBy: _id,
        productCount: count,
    });
    resp.json(new ApiResponse("product added on cart", 200, addOnCart));
}));
export const getCartProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const findCart = yield Cart.find({ addedBy: _id }).populate("product");
    console.log(findCart);
    resp.json(new ApiResponse("", 200, findCart));
}));
export const deleteCartProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.body;
    if (!productId) {
        throw new ApiError("please provide id");
    }
    const deleteCart = yield Cart.findByIdAndDelete(productId);
    if (!deleteCart) {
        throw new ApiError("faild to delete");
    }
    resp.json(new ApiResponse("product deleted from cart", 200, null));
}));
export const checkLogin = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken } = req.cookies;
    if (!accessToken) {
        throw new ApiError("");
    }
    const decodAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRETE);
    if (!decodAccessToken) {
        throw new ApiError("Invalid token");
    }
    const findUser = yield User.findById(decodAccessToken._id).select("-password -refreshToken");
    if (!findUser) {
        throw new ApiError("User not found");
    }
    resp.json(new ApiResponse("", 200, findUser));
}));
export const getAllCustomerUser = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield User.find().populate("address");
    resp.status(200).json(new ApiResponse("", 200, findUser));
}));
export const getMyAllCustomerForSeller = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Order.aggregate([
        { $unwind: "$product" },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productList",
            },
        },
        { $unwind: "$productList" },
        {
            $lookup: {
                from: "shops",
                localField: "productList.addedBy",
                foreignField: "_id",
                as: "ShopDetails",
            },
        },
        {
            $unwind: "$ShopDetails",
        },
        {
            $match: { "ShopDetails._id": new ObjectId(req.shopId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "purchaseBy",
                foreignField: "_id",
                as: "customer",
            },
        },
        {
            $unwind: "$customer",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, user));
}));
export const getUser = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User.findOne({ _id: id }).populate("address");
    resp.status(200).json(new ApiResponse("", 200, user));
}));
export const blockUserByAdmin = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const data = yield User.findByIdAndUpdate(id, {
        $set: {
            block: true,
        },
        new: true,
    });
    resp
        .status(200)
        .json(new ApiResponse("user blocked successfully", 200, data));
}));
export const unBlockUserByAdmin = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const data = yield User.findByIdAndUpdate(id, {
        $set: {
            block: false,
        },
        new: true,
    });
    resp
        .status(200)
        .json(new ApiResponse("user unBlocked successfully", 200, data));
}));
