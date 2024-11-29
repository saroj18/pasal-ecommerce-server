import { populate } from "dotenv";
import { Shop } from "../model/shop-details-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/nodemailer-config.js";
import { shopVerifyApproveEmailContent } from "../mail-message/shop-verified.js";
import { shopVerifyRejectEmailContent } from "../mail-message/shop-reject.js";
import { Customer, User } from "../model/user.model.js";

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
  const { flag, shopId, report } = req.body;

  if (!flag) {
    throw new ApiError("please provide flag first");
  }

  if (flag === "approve") {
    const shopUser = await Shop.findByIdAndUpdate(shopId, {
      $set: {
        verified: true,
      },
    }).populate("owner");

    const emailSend = await sendEmail(
      (shopUser.owner as Customer).email,
      "Shop Verified",
      shopVerifyApproveEmailContent(
        (shopUser.owner as Customer).fullname,
        shopUser.shopName,
        shopUser.createdAt,
        report
      )
    );

    if (!emailSend) {
      throw new ApiError("failed to send email");
    }

    resp
      .status(200)
      .json(new ApiResponse("vendor verify successfully", 200, null));
  }

  if (flag === "reject") {
    const delteShop = await Shop.findByIdAndDelete(shopId).populate("owner");
    console.log(delteShop);

    await User.findByIdAndUpdate(delteShop.owner, {
      $set: {
        shopVerify: false,
      },
    });

    const emailSend = await sendEmail(
      (delteShop.owner as Customer).email,
      "Shop Verified",
      shopVerifyRejectEmailContent(
        (delteShop.owner as Customer).fullname,
        delteShop.shopName,
        report
      )
    );

    if (!emailSend) {
      throw new ApiError("failed to send email");
    }

    resp.status(200).json(new ApiResponse("send mail successfully", 200, null));
  }
});
