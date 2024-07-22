import { Product } from "../model/product-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {
  deleteFromCloudinary,
  uploadImageOnCloudinary,
} from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ProductZodSchema } from "../zodschema/product/product.js";

export const addProduct = asyncHandler(async (req, resp) => {
  const {
    name,
    description,
    brand,
    barganing,
    chating,
    stock,
    category,
    features,
    price,
    discount,
  } = JSON.parse(req.body.productInfo);
  const images = req.files as Express.Multer.File[];
  console.log(images);

  const validateInfo = ProductZodSchema.safeParse({
    name,
    description,
    brand,
    barganing,
    chating,
    stock,
    category,
    features,
    price,
    discount,
    images,
  });
  if (!validateInfo.success) {
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const uploadOnCloudinary = await uploadImageOnCloudinary(images, "products");

  const saveProductOnDb = await Product.create({
    name,
    description,
    brand,
    barganing,
    chating,
    stock,
    category,
    features,
    price,
    discount,
    images: uploadOnCloudinary,
    addedBy: req.user._id,
  });

  if (!saveProductOnDb) {
    throw new Error("faild to save on db");
  }

  resp
    .status(200)
    .json(new ApiResponse("successfully added product", 200, saveProductOnDb));
});

export const getInventoryOfProducts = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError("you are unauthorized person");
  }

  const findProducts = await Product.find({ addedBy: _id }).populate({
    path: "addedBy",
    select: "-refreshToken -password",
  });
  console.log(findProducts);

  resp.status(200).json(new ApiResponse("", 200, findProducts));
});

export const getAllProducts = asyncHandler(async (req, resp) => {
  const findProducts = await Product.find().populate({
    path: "addedBy",
    select: "-refreshToken -password",
  });

  resp.status(200).json(new ApiResponse("", 200, findProducts));
});

export const getSingleProduct = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  const findProduct = await Product.findById(id);

  if (!findProduct) {
    throw new ApiError("product not found");
  }

  resp.status(200).json(new ApiResponse("", 200, findProduct));
});

export const deleteProduct = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  const findProduct = await Product.findByIdAndDelete(id);

  if (!findProduct) {
    throw new ApiError("product not found");
  }

  resp
    .status(200)
    .json(new ApiResponse("product deleted successfully", 200, findProduct));
});

export const updateProduct = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  const {
    name,
    description,
    brand,
    barganing,
    chating,
    stock,
    category,
    features,
    price,
    discount,
    image,
  } = req.body;

  await deleteFromCloudinary(image);
  const images = req.files as Express.Multer.File[];
  const uploadOnCloudinary = await uploadImageOnCloudinary(images, "products");

  const validateInfo = ProductZodSchema.safeParse({
    name,
    description,
    brand,
    barganing,
    chating,
    stock,
    category,
    features,
    price,
    discount,
    images: uploadOnCloudinary,
  });
  if (!validateInfo.success) {
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const updateProduct = await Product.findByIdAndUpdate(id, {
    name,
    description,
    brand,
    barganing,
    chating,
    stock,
    category,
    features,
    price,
    discount,
  });

  if (!updateProduct) {
    throw new ApiError("product not found");
  }

  resp
    .status(200)
    .json(new ApiResponse("product updated successfully", 200, updateProduct));
});
