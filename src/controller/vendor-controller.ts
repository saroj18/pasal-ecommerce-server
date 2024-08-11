import { populate } from "dotenv";
import { Shop } from "../model/shop-details-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import path from "path";

export const getAllVendor = asyncHandler(async (req, resp) => {
  const vendor = await Shop.find().populate({
    path: "owner",
    populate: {
      path: "address",
    },
  });

  resp.status(200).json(new ApiResponse("", 200, vendor));
});

export const getSingleVendor = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  const findVendor = await Shop.findById(id);

  resp.status(200).json(new ApiResponse("", 200, findVendor));
});
