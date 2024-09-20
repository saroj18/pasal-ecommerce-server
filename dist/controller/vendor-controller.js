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
import { sendEmail } from "../utils/nodemailer-config.js";
import { shopVerifyApproveEmailContent } from "../mail-message/shop-verified.js";
import { shopVerifyRejectEmailContent } from "../mail-message/shop-reject.js";
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
    const { flag, shopId, report } = req.body;
    if (!flag) {
        throw new ApiError("please provide flag first");
    }
    if (flag === "approve") {
        const shopUser = yield Shop.findByIdAndUpdate(shopId, {
            $set: {
                verified: true,
            },
        }).populate("owner");
        const emailSend = yield sendEmail(shopUser.owner.email, "Shop Verified", shopVerifyApproveEmailContent(shopUser.owner.fullname, shopUser.shopName, shopUser.createdAt, report));
        if (!emailSend) {
            throw new ApiError("failed to send email");
        }
        resp
            .status(200)
            .json(new ApiResponse("vendor verify successfully", 200, null));
    }
    if (flag === "reject") {
        const shopUser = yield Shop.findByIdAndUpdate(shopId, {
            $set: {
                verified: false,
            },
        }).populate("owner");
        const emailSend = yield sendEmail(shopUser.owner.email, "Shop Verified", shopVerifyRejectEmailContent(shopUser.owner.fullname, shopUser.shopName, report));
        if (!emailSend) {
            throw new ApiError("failed to send email");
        }
        resp
            .status(200)
            .json(new ApiResponse("vendor verify successfully", 200, null));
    }
}));
