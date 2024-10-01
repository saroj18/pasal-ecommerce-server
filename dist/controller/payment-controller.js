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
import { esewaStatusInfo } from "../helper/esewaStatusInfo.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../model/payment-model.js";
import { Order } from "../model/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ObjectId } from "mongodb";
import { Cart } from "../model/cart-model.js";
import { Product } from "../model/product-model.js";
import { khaltiPaymentVerify } from "../utils/khaltiPaymentVerify.js";
export const esewaStatusCheck = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    const { _id } = req.user;
    if (!token) {
        throw new Error("token is required");
    }
    let decodeToken = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const getStatusInfo = yield esewaStatusInfo(decodeToken);
    if (getStatusInfo.status != "COMPLETE") {
        throw new ApiError("your order was not created");
    }
    const productOrder = yield Order.findByIdAndUpdate(getStatusInfo.transaction_uuid, {
        $set: {
            paymentStatus: "complete",
            orderComplete: true,
        },
    }, {
        new: true,
    });
    if (!productOrder) {
        throw new ApiError("there is no any orders");
    }
    yield Payment.create({
        order: productOrder._id,
        status: "COMPLETE",
        ref_id: getStatusInfo.ref_id,
        payMethod: "esewa",
    });
    yield Cart.deleteMany({ addedBy: _id });
    productOrder.cartInfo.forEach((ele) => __awaiter(void 0, void 0, void 0, function* () {
        yield Product.findByIdAndUpdate(ele.product, {
            $inc: {
                totalSale: ele.productCount,
            },
        });
    }));
    resp.status(200).json(new ApiResponse("", 200, null));
}));
export const getPaymentHistory = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (!id) {
        throw new ApiError("please provide id");
    }
    const payment = yield Payment.aggregate([
        {
            $unwind: "$order",
        },
        {
            $lookup: {
                from: "orders",
                localField: "order",
                foreignField: "_id",
                as: "orders",
            },
        },
        {
            $unwind: "$orders",
        },
        {
            $match: {
                "orders.purchaseBy": new ObjectId(id),
            },
        },
        {
            $unwind: "$orders.product",
        },
        {
            $lookup: {
                from: "products",
                localField: "orders.product",
                foreignField: "_id",
                as: "products",
            },
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "shops",
                localField: "products.addedBy",
                foreignField: "_id",
                as: "shop",
            },
        },
        {
            $unwind: "$shop",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, payment));
}));
// get payment history of vendor's for admin side
export const paymentHistoryOfVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (!id) {
        throw new ApiError("please provide id");
    }
    const findPayment = yield Payment.aggregate([
        {
            $lookup: {
                from: "orders",
                localField: "order",
                foreignField: "_id",
                as: "orders",
            },
        },
        {
            $unwind: "$orders",
        },
        {
            $lookup: {
                from: "products",
                localField: "orders.product",
                foreignField: "_id",
                as: "products",
            },
        },
        {
            $unwind: "$products",
        },
        {
            $match: {
                "products.addedBy": new ObjectId(id),
            },
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "shops",
                localField: "orders.products.addedBy",
                foreignField: "_id",
                as: "shop",
            },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, findPayment));
}));
export const khaltiCallback = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.query;
    const { _id } = req.user;
    console.log(data);
    const verify = yield khaltiPaymentVerify(data.pidx);
    if (verify.status != "Completed") {
        throw new ApiError("failed to verify your payment");
    }
    const productOrder = yield Order.findByIdAndUpdate(data.purchase_order_id, {
        $set: {
            paymentStatus: "complete",
            orderComplete: true,
        },
    }, {
        new: true,
    });
    if (!productOrder) {
        throw new ApiError("there is no any orders");
    }
    yield Payment.create({
        order: productOrder._id,
        status: "COMPLETE",
        ref_id: verify.pidx,
        payMethod: "khalti",
    });
    yield Cart.deleteMany({ addedBy: _id });
    productOrder.cartInfo.forEach((ele) => __awaiter(void 0, void 0, void 0, function* () {
        yield Product.findByIdAndUpdate(ele.product, {
            $inc: {
                totalSale: ele.productCount,
            },
        });
    }));
    resp.status(200).json(new ApiResponse("", 200, null));
}));
