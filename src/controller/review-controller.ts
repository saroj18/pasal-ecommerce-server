import { Order } from "../model/order.model.js";
import { Product } from "../model/product-model.js";
import { Review } from "../model/review-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ObjectId } from "mongodb";

export const productForReviewRemainig = asyncHandler(async (req, resp) => {
  const order = await Order.find({
    status: "complete",
    reviewed: false,
  }).populate([
    { path: "deleveryAddress" },
    { path: "billingAddress" },
    { path: "purchaseBy" },
    {
      path: "product",
      populate: { path: "addedBy" },
    },
  ]);
  console.log("dd", order);

  resp.status(200).json(new ApiResponse("", 200, order));
});

export const createReview = asyncHandler(async (req, resp) => {
  const { reviewText, id, orderId, star } = req.body;

  if ([reviewText, id].includes("")) {
    throw new ApiError("please provide required info");
  }

  const createReview = await Review.create({
    reviewBy: req.user._id,
    reviewProduct: id,
    reviewMessage: reviewText,
    reviewStar: star,
  });

  await Product.findByIdAndUpdate(id, {
    $push: {
      starArray: star,
    },
  });

  if (!createReview) {
    throw new ApiError("failed to create review");
  }

  await Order.findByIdAndUpdate(orderId, {
    reviewed: true,
  });

  await Product.findByIdAndUpdate(id, {
    $push: {
      review: createReview._id,
    },
  });

  resp
    .status(200)
    .json(new ApiResponse("review post successfully", 200, createReview));
});

export const getAllReview = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  const review = await Review.find({ reviewBy: _id }).populate([
    {
      path: "reviewProduct",
      populate: {
        path: "addedBy",
      },
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, review));
});

export const getAllMyReviewForSeller = asyncHandler(async (req, resp) => {
  const findReview = await Review.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "reviewProduct",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $match: {
        "product.addedBy": new ObjectId(req.shopId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "reviewBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, findReview));
});

export const getAllMyReviewForAdmin = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  const findReview = await Review.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "reviewProduct",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $match: {
        reviewBy: new ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "reviewBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "reviewProduct",
        foreignField: "_id",
        as: "reviewProduct",
      },
    },
    {
      $unwind: "$reviewProduct",
    },
    {
      $unwind: "$user",
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, findReview));
});

//get all vendor's review for admin
export const getVendoerAllReviewForAdmin = asyncHandler(async (req, resp) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError("please provide id");
  }

  const findReview = await Review.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "reviewProduct",
        foreignField: "_id",
        as: "reviewProduct",
      },
    },
    {
      $unwind: "$reviewProduct",
    },
    {
      $match: {
        "reviewProduct.addedBy": new ObjectId(id as string),
      },
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, findReview));
});
