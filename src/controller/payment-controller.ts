import fetch from "node-fetch";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { esewaStatusInfo } from "../helper/esewaStatusInfo.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../model/payment-model.js";
import { Order } from "../model/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ObjectId } from "mongodb";
import { Cart } from "../model/cart-model.js";
import { Product } from "../model/product-model.js";

export const esewaStatusCheck = asyncHandler(async (req, resp) => {
  const { token } = req.body;
  const { _id } = req.user;

  if (!token) {
    throw new Error("token is required");
  }

  let decodeToken: { [key: string]: string } = JSON.parse(
    Buffer.from(token, "base64").toString("utf-8")
  );

  const getStatusInfo = await esewaStatusInfo(decodeToken);

  if (getStatusInfo.status != "COMPLETE") {
    throw new ApiError("your order was not created");
  }

  const productOrder = await Order.findByIdAndUpdate(
    getStatusInfo.transaction_uuid,
    {
      $set: {
        paymentStatus: "complete",
        orderComplete: true,
      },
    },
    {
      new: true,
    }
  );
  if (!productOrder) {
    throw new ApiError("there is no any orders");
  }
  await Payment.create({
    order: productOrder._id,
    status: "COMPLETE",
    ref_id: getStatusInfo.ref_id,
  });
  console.log("ks", productOrder.cartInfo);

  await Cart.deleteMany({ addedBy: _id });

  productOrder.cartInfo.forEach(async (ele) => {
    await Product.findByIdAndUpdate(ele.product._id, {
      $inc: {
        totalSale: ele.productCount,
      },
    });
  });

  resp.status(200).json(new ApiResponse("", 200, null));
});

export const getPaymentHistory = asyncHandler(async (req, resp) => {
  const { id } = req.query;
  if (!id) {
    throw new ApiError("please provide id");
  }
  const payment = await Payment.aggregate([
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
        "orders.purchaseBy": new ObjectId(id as string),
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
});

// get payment history of vendor's for admin side

export const paymentHistoryOfVendor = asyncHandler(async (req, resp) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError("please provide id");
  }

  const findPayment = await Payment.aggregate([
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
        "products.addedBy": new ObjectId(id as string),
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
});
