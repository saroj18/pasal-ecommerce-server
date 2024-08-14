var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { esewaOrderForm } from "../helper/esewaOrderForm.js";
import { Order } from "../model/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { createOrderHash } from "../utils/esewaOrderHash.js";
import { ObjectId } from "mongodb";
export const productOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderDetails } = req.body;
    const { product, billingAddress, deleveryAddress, payMethod, totalPrice, deleveryCharge, } = orderDetails;
    const { _id } = req.user;
    if (!billingAddress ||
        !deleveryAddress ||
        !payMethod ||
        !totalPrice ||
        product.length < 1) {
        throw new ApiError("please provide all details");
    }
    const order = yield Order.create({
        product,
        payMethod,
        totalPrice,
        billingAddress,
        deleveryAddress,
        purchaseBy: _id,
        deleveryCharge,
    });
    const esewaHash = createOrderHash(order.totalPrice, order._id, deleveryCharge);
    const orderData = yield esewaOrderForm(esewaHash, order.totalPrice, order._id, order.deleveryCharge);
    console.log("sarojaryal", order.totalPrice);
    resp.status(200).json(new ApiResponse("", 200, orderData));
}));
export const getMyOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    yield Order.deleteMany({
        $and: [{ purchaseBy: _id }, { orderComplete: false }],
    });
    const myOrder = yield Order.find({ purchaseBy: _id }).populate([
        { path: "deleveryAddress" },
        { path: "billingAddress" },
        { path: "purchaseBy" },
        {
            path: "product",
            // populate: { path: "addedBy", populate: { path: "address" } },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, myOrder));
}));
export const getMyOrderForSeller = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("idd", req.shopId);
    const order = yield Order.aggregate([
        { $unwind: "$product" },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "orderProducts",
            },
        },
        {
            $unwind: "$orderProducts",
        },
        {
            $match: {
                "orderProducts.addedBy": new ObjectId(req.shopId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "purchaseBy",
                foreignField: "_id",
                as: "customer"
            }
        }
    ]);
    resp.status(200).json(new ApiResponse("", 200, order));
}));
