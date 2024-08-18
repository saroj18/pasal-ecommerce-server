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
import { Product } from "../model/product-model.js";
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
        status: "pending",
    });
    const esewaHash = createOrderHash(order.totalPrice, order._id, deleveryCharge);
    const orderData = yield esewaOrderForm(esewaHash, order.totalPrice, order._id, order.deleveryCharge);
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
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, myOrder));
}));
//admin see user's order
export const getMyOrderForAdmin = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield Order.deleteMany({
        $and: [{ purchaseBy: id }, { orderComplete: false }],
    });
    // const myOrder = await Order.find({ purchaseBy: id }).populate([
    //   { path: "deleveryAddress" },
    //   { path: "billingAddress" },
    //   { path: "purchaseBy" },
    //   {
    //     path: "product",
    //   },
    // ]);
    const myOrder = yield Order.aggregate([
        {
            $match: {
                purchaseBy: new ObjectId(id),
            },
        },
        {
            $lookup: {
                from: "addresses",
                localField: "deleveryAddress",
                foreignField: "_id",
                as: "deleveryAddress",
            },
        },
        {
            $lookup: {
                from: "addresses",
                localField: "billingAddress",
                foreignField: "_id",
                as: "billingAddress",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "purchaseBy",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: "$deleveryAddress",
        },
        {
            $unwind: "$billingAddress",
        },
        {
            $group: {
                _id: "$status",
                info: {
                    $push: "$$ROOT",
                },
            },
        },
        {
            $unwind: "$info",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, myOrder));
}));
//seller see own's order
export const getMyOrderForSeller = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("idd", req.shopId);
    const order = yield Order.aggregate([
        {
            $match: {
                status: "pending",
            },
        },
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
                as: "customer",
            },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, order));
}));
//order placed by seller
export const orderPlacedBySeller = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        throw new ApiError("please provide id");
    }
    const orderPlaced = yield Order.findByIdAndUpdate(id, {
        $set: {
            status: "complete",
        },
        new: true,
    });
    let data = yield Product.findOneAndUpdate({ _id: { $in: orderPlaced === null || orderPlaced === void 0 ? void 0 : orderPlaced.product } }, {
        $inc: {
            stock: -1,
        },
    }, {
        new: true,
    });
    resp
        .status(200)
        .json(new ApiResponse("order placed successfully", 200, orderPlaced));
}));
//order cancle by seller
export const orderCancledBySeller = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        throw new ApiError("please provid id");
    }
    const cancleOrder = yield Order.findByIdAndUpdate(id, {
        $set: {
            status: "cancled",
        },
        new: true,
    });
    resp
        .status(200)
        .json(new ApiResponse("order cancled successfully", 200, cancleOrder));
}));
export const pendingOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    yield Order.deleteMany({
        $and: [{ purchaseBy: _id }, { orderComplete: false }],
    });
    const order = yield Order.find({ status: "pending" }).populate([
        { path: "deleveryAddress" },
        { path: "billingAddress" },
        { path: "purchaseBy" },
        {
            path: "product",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, order));
}));
export const placedOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield Order.find({ status: "complete" }).populate([
        { path: "deleveryAddress" },
        { path: "billingAddress" },
        { path: "purchaseBy" },
        {
            path: "product",
            populate: { path: "addedBy" },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, order));
}));
export const cancledOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield Order.find({ status: "cancled" }).populate([
        { path: "deleveryAddress" },
        { path: "billingAddress" },
        { path: "purchaseBy" },
        {
            path: "product",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, order));
}));
// order history of vendor
export const orderHistoryOfVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    console.log("iddd", id);
    if (!id) {
        throw new ApiError("please provide id");
    }
    const findOrder = yield Order.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $match: {
                product: {
                    $elemMatch: {
                        addedBy: new ObjectId(id)
                    }
                }
            },
        },
        {
            $lookup: {
                from: "addresses",
                localField: "deleveryAddress",
                foreignField: "_id",
                as: "deleveryAddress",
            },
        },
        {
            $lookup: {
                from: "addresses",
                localField: "billingAddress",
                foreignField: "_id",
                as: "billingAddress",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "purchaseBy",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$deleveryAddress",
        },
        {
            $unwind: "$billingAddress",
        },
        {
            $group: {
                _id: "$status",
                info: {
                    $push: "$$ROOT",
                },
            },
        },
        {
            $unwind: "$info",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, findOrder));
}));
