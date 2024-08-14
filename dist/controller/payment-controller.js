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
export const esewaStatusCheck = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    // const { _id } = req.user;
    console.log("finalToken", token);
    if (!token) {
        throw new Error("token is required");
    }
    let decodeToken = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    console.log("ss", decodeToken);
    const getStatusInfo = yield esewaStatusInfo(decodeToken);
    console.log("ttt", getStatusInfo);
    if (getStatusInfo.status != "COMPLETE") {
        // await Order.findByIdAndDelete(getStatusInfo.transaction_uuid);
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
    console.log("soraa>>>", productOrder);
    if (!productOrder) {
        throw new ApiError("there is no any orders");
    }
    yield Payment.create({
        order: productOrder._id,
        status: "COMPLETE",
        ref_id: getStatusInfo.ref_id,
    });
    resp.status(200).json(new ApiResponse("", 200, null));
}));
