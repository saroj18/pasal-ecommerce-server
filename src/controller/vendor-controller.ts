import { populate } from "dotenv";
import { Shop } from "../model/shop-details-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

export const getAllaVerifiedVendor = asyncHandler(async (req, resp) => {
  const vendor = await Shop.find({ verified: true }).populate({
    path: "owner",
    populate: {
      path: "address",
    },
  });

  resp.status(200).json(new ApiResponse("", 200, vendor));
});

export const getSingleVendor = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  const findVendor = await Shop.findById(id).populate("owner");

  resp.status(200).json(new ApiResponse("", 200, findVendor));
});

export const getUnverifiedVendor = asyncHandler(async (req, resp) => {
  const findVendor = await Shop.find({ verified: false }).populate("owner");

  resp.status(200).json(new ApiResponse("", 200, findVendor));
});

export const vendorVefify = asyncHandler(async (req, resp) => {
  const { flag, shopId } = req.body;

  if (!flag) {
    throw new ApiError("please provide flag first");
  }

  if (flag === "approve") {
    await Shop.findByIdAndUpdate(shopId, {
      $set: {
        verified: true,
      },
    });

    resp
      .status(200)
      .json(new ApiResponse("vendor verify successfully", 200, null));
  }
});
