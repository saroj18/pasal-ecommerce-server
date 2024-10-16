import fetch from "node-fetch";
import { esewaOrderForm } from "../helper/esewaOrderForm.js";
import { Order, OrderType } from "../model/order.model.js";
import { Product } from "../model/product-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { createOrderHash } from "../utils/esewaOrderHash.js";
import { ObjectId } from "mongodb";
import { Customer, User } from "../model/user.model.js";
import { khaltiOrderHandler } from "../utils/khaltiOrderHandler.js";
import { sendEmail } from "../utils/nodemailer-config.js";
import { orderPlacedEmailContent } from "../mail-message/order-placed.js";
import { Payment } from "../model/payment-model.js";
import { Cart } from "../model/cart-model.js";

export const productOrder = asyncHandler(async (req, resp) => {
  const { orderDetails } = req.body;
  const {
    product,
    billingAddress,
    deleveryAddress,
    payMethod,
    totalPrice,
    deleveryCharge,
    cartInfo,
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

  if (payMethod == "cash") {
    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError("User not found");
    }

    const order = await Order.create({
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

    await Payment.create({
      order: order._id,
      status: "COMPLETE",
      ref_id: Math.random() * 1000,
      payMethod: "cash",
    });

    
    await Promise.all(
      order.cartInfo.map(async(cart) => {
        await Product.findByIdAndUpdate(cart.product, {
          $inc: {
            totalSale:cart.productCount
          }
        })
      })
    )

    await Cart.deleteMany({ addedBy: order.purchaseBy });
    resp.status(200).json(new ApiResponse("", 200, order));
return
  }

  const order = await Order.create({
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

    resp.status(200).json(new ApiResponse("", 200, orderData));
  }

  if (payMethod === "khalti") {
    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError("User not found");
    }
    const khaltiResponse = await khaltiOrderHandler(totalPrice, user, order);
    console.log(khaltiResponse);

    resp.status(200).json(new ApiResponse("", 200, khaltiResponse));
  }
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
    },
  ]);
  resp.status(200).json(new ApiResponse("", 200, myOrder));
});

//admin see user's order
export const getMyOrderForAdmin = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  await Order.deleteMany({
    $and: [{ purchaseBy: id }, { orderComplete: false }],
  });

  const myOrder = await Order.aggregate([
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
});

//seller see own's order

export const getMyOrderForSeller = asyncHandler(async (req, resp) => {
  console.log("idd", req.shopId);
  const order = await Order.aggregate([
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
});

//order placed by seller

export const orderPlacedBySeller = asyncHandler(async (req, resp) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError("please provide id");
  }

  const orderPlaced = await Order.findByIdAndUpdate(id, {
    $set: {
      status: "complete",
    },
    new: true,
  }).populate([{ path: "purchaseBy" }, { path: "product" }]);

  orderPlaced.cartInfo.forEach(async (ele) => {
    await Product.updateOne(
      { _id: ele.product },
      {
        $inc: {
          stock: -ele.productCount,
        },
      }
    );
  });

  const mailSend = await sendEmail(
    (orderPlaced.purchaseBy as Customer).email,
    "Order Placed",
    orderPlacedEmailContent(
      (orderPlaced.purchaseBy as Customer).fullname,
      orderPlaced._id as string,
      orderPlaced.product as Product[],
      orderPlaced.totalPrice
    )
  );

  if (!mailSend) {
    throw new ApiError("failed to send order mail");
  }

  resp
    .status(200)
    .json(new ApiResponse("order placed successfully", 200, null));
});

//order cancle by seller
export const orderCancledBySeller = asyncHandler(async (req, resp) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError("please provid id");
  }

  const cancleOrder = await Order.findByIdAndUpdate(id, {
    $set: {
      status: "cancled",
    },
    new: true,
  });


  await Promise.all(cancleOrder.cartInfo.map(async(prod) => {
    await Product.updateMany(
    { _id: prod.product },
    { $inc: { totalSale: -Number(prod.productCount) } }
  );
  }))

  resp
    .status(200)
    .json(new ApiResponse("order cancled successfully", 200, cancleOrder));
});

export const pendingOrder = asyncHandler(async (req, resp) => {
  const { _id } = req.user;
  await Order.deleteMany({
    $and: [{ purchaseBy: _id }, { orderComplete: false }],
  });

  const findOrder = await Order.aggregate([
    {
      $match: {
        purchaseBy: new ObjectId(_id as string),
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
        createdAt:-1
      }
    }
    
  ]);

  resp.status(200).json(new ApiResponse("", 200, findOrder));
});

export const placedOrder = asyncHandler(async (req, resp) => {
  const order = await Order.find({ status: "complete" }).populate([
    { path: "deleveryAddress" },
    { path: "billingAddress" },
    { path: "purchaseBy" },
    {
      path: "product",
      populate: { path: "addedBy" },
    },
  ]).sort({createdAt:1});

  resp.status(200).json(new ApiResponse("", 200, order));
});

export const cancledOrder = asyncHandler(async (req, resp) => {
  const order = await Order.find({ status: "cancled" }).populate([
    { path: "deleveryAddress" },
    { path: "billingAddress" },
    { path: "purchaseBy" },
    {
      path: "product",
    },
  ]).sort({createdAt:1});

  resp.status(200).json(new ApiResponse("", 200, order));
});

// order history of vendor

export const orderHistoryOfVendor = asyncHandler(async (req, resp) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError("please provide id");
  }

  const findOrder = await Order.aggregate([
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
        "product.addedBy": new ObjectId(id as string),
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
});
