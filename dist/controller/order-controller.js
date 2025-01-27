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
import { User } from "../model/user.model.js";
import { khaltiOrderHandler } from "../utils/khaltiOrderHandler.js";
import { sendEmail } from "../utils/nodemailer-config.js";
import { orderPlacedEmailContent } from "../mail-message/order-placed.js";
import { Payment } from "../model/payment-model.js";
import { Cart } from "../model/cart-model.js";
export const productOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderDetails } = req.body;
    const { product, billingAddress, deleveryAddress, payMethod, totalPrice, deleveryCharge, cartInfo, } = orderDetails;
    const { _id } = req.user;
    if (!billingAddress ||
        !deleveryAddress ||
        !payMethod ||
        !totalPrice ||
        product.length < 1) {
        throw new ApiError("please provide all details");
    }
    if (payMethod == "cash") {
        const user = yield User.findById(_id);
        if (!user) {
            throw new ApiError("User not found");
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
            cartInfo,
            paymentStatus: "complete",
            orderComplete: true,
        });
        if (!order) {
            throw new ApiError("failed to save on db");
        }
        yield Payment.create({
            order: order._id,
            status: "COMPLETE",
            ref_id: Math.random() * 1000,
            payMethod: "cash",
        });
        yield Promise.all(order.cartInfo.map((cart) => __awaiter(void 0, void 0, void 0, function* () {
            yield Product.findByIdAndUpdate(cart.product, {
                $inc: {
                    totalSale: cart.productCount
                }
            });
        })));
        yield Cart.deleteMany({ addedBy: order.purchaseBy });
        resp.status(200).json(new ApiResponse("", 200, order));
        return;
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
        cartInfo,
    });
    if (payMethod === "esewa") {
        const esewaHash = createOrderHash(order.totalPrice, order._id, deleveryCharge);
        const orderData = yield esewaOrderForm(esewaHash, order.totalPrice, order._id, order.deleveryCharge);
        resp.status(200).json(new ApiResponse("", 200, orderData));
    }
    if (payMethod === "khalti") {
        const user = yield User.findById(_id);
        if (!user) {
            throw new ApiError("User not found");
        }
        const khaltiResponse = yield khaltiOrderHandler(totalPrice, user, order);
        console.log(khaltiResponse);
        resp.status(200).json(new ApiResponse("", 200, khaltiResponse));
    }
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
            $unwind: "$product",
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
        // {
        //   $unwind: "$info",
        // },
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
    }).populate([{ path: "purchaseBy" }, { path: "product" }]);
    orderPlaced.cartInfo.forEach((ele) => __awaiter(void 0, void 0, void 0, function* () {
        yield Product.updateOne({ _id: ele.product }, {
            $inc: {
                stock: -ele.productCount,
            },
        });
    }));
    const mailSend = yield sendEmail(orderPlaced.purchaseBy.email, "Order Placed", orderPlacedEmailContent(orderPlaced.purchaseBy.fullname, orderPlaced._id, orderPlaced.product, orderPlaced.totalPrice));
    if (!mailSend) {
        throw new ApiError("failed to send order mail");
    }
    resp
        .status(200)
        .json(new ApiResponse("order placed successfully", 200, null));
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
    yield Promise.all(cancleOrder.cartInfo.map((prod) => __awaiter(void 0, void 0, void 0, function* () {
        yield Product.updateMany({ _id: prod.product }, { $inc: { totalSale: -Number(prod.productCount) } });
    })));
    resp
        .status(200)
        .json(new ApiResponse("order cancled successfully", 200, cancleOrder));
}));
export const pendingOrder = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    yield Order.deleteMany({
        $and: [{ purchaseBy: _id }, { orderComplete: false }],
    });
    const findOrder = yield Order.aggregate([
        {
            $match: {
                purchaseBy: new ObjectId(_id),
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
            $unwind: "$product",
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
            $sort: {
                createdAt: -1
            }
        }
    ]);
    resp.status(200).json(new ApiResponse("", 200, findOrder));
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
    ]).sort({ createdAt: 1 });
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
    ]).sort({ createdAt: 1 });
    resp.status(200).json(new ApiResponse("", 200, order));
}));
// order history of vendor
export const orderHistoryOfVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
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
            $unwind: "$product",
        },
        {
            $match: {
                "product.addedBy": new ObjectId(id),
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
    ]);
    resp.status(200).json(new ApiResponse("", 200, findOrder));
}));
