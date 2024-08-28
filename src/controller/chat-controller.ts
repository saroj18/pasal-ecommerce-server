import { Chat } from "../model/chat-model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const getAllChatForCustomerAndVendor = asyncHandler(
  async (req, resp) => {
    const { id } = req.query;
    console.log(">>", id);
    console.log(">>", req.user._id);

    const chats = await Chat.find({
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
  }
);

export const getMyChatCustomer = asyncHandler(async (req, resp) => {
  const user = await Chat.aggregate([
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
});
