var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Shop } from "../model/shop-details-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
export const getAllaVerifiedVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = yield Shop.find({ verified: true }).populate({
        path: "owner",
        populate: {
            path: "address",
        },
    });
    resp.status(200).json(new ApiResponse("", 200, vendor));
}));
export const getSingleVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const findVendor = yield Shop.findById(id).populate("owner");
    resp.status(200).json(new ApiResponse("", 200, findVendor));
}));
export const getUnverifiedVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const findVendor = yield Shop.find({ verified: false }).populate("owner");
    resp.status(200).json(new ApiResponse("", 200, findVendor));
}));
export const vendorVefify = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { flag, shopId } = req.body;
    if (!flag) {
        throw new ApiError("please provide flag first");
    }
    if (flag === "approve") {
        yield Shop.findByIdAndUpdate(shopId, {
            $set: {
                verified: true,
            },
        });
        resp
            .status(200)
            .json(new ApiResponse("vendor verify successfully", 200, null));
    }
}));
