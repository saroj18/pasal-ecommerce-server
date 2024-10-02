var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Coupen } from "../model/coupen-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
export const createCoupen = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { coupenName, coupenDiscount, coupenCode } = req.body;
    if (!coupenName || !coupenCode || !coupenDiscount) {
        throw new ApiError("please provide required info");
    }
    const coupen = yield Coupen.create({
        coupenName,
        coupenCode,
        coupenDiscount
    });
    if (!coupen) {
        throw new ApiError("failed to create coupen");
    }
    resp.status(200).json(new ApiResponse("coupen create successfully", 200, coupen));
}));
export const deleteCoupen = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (!id) {
        throw new ApiError("please provide id");
    }
    const deleteCoupen = yield Coupen.findByIdAndDelete(id);
    if (!deleteCoupen) {
        throw new ApiError("failed to delete coupen");
    }
    resp.status(200).json(new ApiResponse("coupen deleted successfully", 200, deleteCoupen));
}));
export const checkCoupen = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { coupen } = req.body;
    if (!coupen) {
        throw new ApiError("please provide coupen code");
    }
    const findCoupen = yield Coupen.findOne({ coupenCode: { $regex: new RegExp(`^${coupen}$`, 'i') } });
    if (!findCoupen) {
        throw new ApiError("your coupen is not valid");
    }
    resp.status(200).json(new ApiResponse("", 200, findCoupen));
}));
export const getAllCoupen = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const findCoupen = yield Coupen.find();
    if (findCoupen.length == 0 || !findCoupen) {
        throw new ApiError("coupen not found");
    }
    resp.status(200).json(new ApiResponse("", 200, findCoupen));
}));
