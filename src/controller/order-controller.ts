import { esewaOrderForm } from "../helper/esewaOrderForm.js";
import { Order } from "../model/order.model.js";
import { Product } from "../model/product-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { createOrderHash } from "../utils/esewaOrderHash.js";
import { ObjectId } from "mongodb";

export const productOrder = asyncHandler(async (req, resp) => {
  const { orderDetails } = req.body;
  const {
    product,
    billingAddress,
    deleveryAddress,
    payMethod,
    totalPrice,
    deleveryCharge,
  } = orderDetails;
  const { _id } = req.user;

  if (
    !billingAddress ||
    !deleveryAddress ||
    !payMethod ||
    !totalPrice ||
    product.length < 1
  ) {
    throw new ApiError("please provide all details");
  }

  const order = await Order.create({
    product,
    payMethod,
    totalPrice,
    billingAddress,
    deleveryAddress,
    purchaseBy: _id,
    deleveryCharge,
  });

  const esewaHash = createOrderHash(
    order.totalPrice,
    order._id as string,
    deleveryCharge
  );

  const orderData = await esewaOrderForm(
    esewaHash,
    order.totalPrice,
    order._id as string,
    order.deleveryCharge
  );

  console.log("sarojaryal", order.totalPrice);

  resp.status(200).json(new ApiResponse("", 200, orderData));
});

export const getMyOrder = asyncHandler(async (req, resp) => {
  const { _id } = req.user;
  await Order.deleteMany({
    $and: [{ purchaseBy: _id }, { orderComplete: false }],
  });

  const myOrder = await Order.find({ purchaseBy: _id }).populate([
    { path: "deleveryAddress" },
    { path: "billingAddress" },
    { path: "purchaseBy" },
    {
      path: "product",
      // populate: { path: "addedBy", populate: { path: "address" } },
    },
  ]);
  resp.status(200).json(new ApiResponse("", 200, myOrder));
});

export const getMyOrderForSeller = asyncHandler(async (req, resp) => {
  console.log("idd", req.shopId);
  const order = await Order.aggregate([
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
      $lookup:{
        from:"users",
        localField:"purchaseBy",
        foreignField:"_id",
        as:"customer"
      }
    }
  ]);

  resp.status(200).json(new ApiResponse("", 200, order));
});
