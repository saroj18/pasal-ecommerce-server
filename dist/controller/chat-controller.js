var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Chat } from "../model/chat-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
export const getAllChatForCustomerAndVendor = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    console.log(">>", id);
    console.log(">>", req.user._id);
    const chats = yield Chat.find({
        type: "customer_and_vendor_chat",
        $or: [
            { $and: [{ sender: req.user._id }, { receiver: id }] },
            { $and: [{ sender: id }, { receiver: req.user._id }] },
        ],
    });
    if (!chats) {
        throw new ApiError("chats not found");
    }
    resp.status(200).json(new ApiResponse("", 200, chats));
}));
export const getMyChatCustomer = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Chat.aggregate([
        {
            $match: {
                $or: [{ sender: req.user._id }, { receiver: req.user._id }],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender",
            },
        },
        {
            $unwind: "$sender",
        },
        {
            $lookup: {
                from: "users",
                localField: "receiver",
                foreignField: "_id",
                as: "receiver",
            },
        },
        {
            $unwind: "$receiver",
        },
        {
            $group: {
                _id: "$sender._id",
                sender: { $first: "$sender" },
                receiver: { $first: "$receiver" },
                createdAt: { $last: "$createdAt" },
                recentMsg: {
                    $last: "$message",
                },
                info: {
                    $push: "$$ROOT",
                },
            },
        },
        {
            $match: {
                _id: {
                    $ne: req.user._id,
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, user));
}));
