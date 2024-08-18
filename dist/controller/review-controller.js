var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Order } from "../model/order.model.js";
import { Product } from "../model/product-model.js";
import { Review } from "../model/review-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ObjectId } from "mongodb";
export const productForReviewRemainig = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield Order.find({
        status: "complete",
        reviewed: false,
    }).populate([
        { path: "deleveryAddress" },
        { path: "billingAddress" },
        { path: "purchaseBy" },
        {
            path: "product",
            populate: { path: "addedBy" },
        },
    ]);
    console.log("dd", order);
    resp.status(200).json(new ApiResponse("", 200, order));
}));
export const createReview = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewText, id, orderId, star } = req.body;
    if ([reviewText, id].includes("")) {
        throw new ApiError("please provide required info");
    }
    const createReview = yield Review.create({
        reviewBy: req.user._id,
        reviewProduct: id,
        reviewMessage: reviewText,
        reviewStar: star,
    });
    yield Product.findByIdAndUpdate(id, {
        $push: {
            starArray: star,
        },
    });
    if (!createReview) {
        throw new ApiError("failed to create review");
    }
    yield Order.findByIdAndUpdate(orderId, {
        reviewed: true,
    });
    yield Product.findByIdAndUpdate(id, {
        $push: {
            review: createReview._id,
        },
    });
    resp
        .status(200)
        .json(new ApiResponse("review post successfully", 200, createReview));
}));
export const getAllReview = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const review = yield Review.find({ reviewBy: _id }).populate([
        {
            path: "reviewProduct",
            populate: {
                path: "addedBy",
            },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, review));
}));
export const getAllMyReviewForSeller = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const findReview = yield Review.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "reviewProduct",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: "$product",
        },
        {
            $match: {
                "product.addedBy": new ObjectId(req.shopId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "reviewBy",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, findReview));
}));
export const getAllMyReviewForAdmin = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const findReview = yield Review.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "reviewProduct",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: "$product",
        },
        {
            $match: {
                reviewBy: new ObjectId(id),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "reviewBy",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "reviewProduct",
                foreignField: "_id",
                as: "reviewProduct",
            },
        },
        {
            $unwind: "$reviewProduct",
        },
        {
            $unwind: "$user",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, findReview));
}));
//get all vendor's review for admin
export const getVendoerAllReviewForAdmin = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (!id) {
        throw new ApiError("please provide id");
    }
    const findReview = yield Review.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "reviewProduct",
                foreignField: "_id",
                as: "reviewProduct",
            },
        },
        {
            $unwind: "$reviewProduct",
        },
        {
            $match: {
                "reviewProduct.addedBy": new ObjectId(id),
            },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, findReview));
}));
