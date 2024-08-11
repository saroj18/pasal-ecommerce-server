import { esewaOrderForm } from "../helper/esewaOrderForm.js";
import { Cart } from "../model/cart-model.js";
import { Product } from "../model/product-model.js";
import { WishList } from "../model/wishlist-model.js";
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

export const addOnWishlist = asyncHandler(async (req, resp) => {
  const { productId } = req.body;
  const { _id } = req.user;

  if (!productId || !_id) {
    throw new ApiError("please provide id");
  }

  const findProduct = await Product.findById(productId);

  if (!findProduct) {
    throw new ApiError("product not found");
  }

  const findOnWishList = await WishList.findOne({
    addedBy: _id,
    product: productId,
  });

  if (findOnWishList) {
    throw new ApiError("product already on wishlist");
  }

  const addOnWishList = await WishList.create({
    addedBy: _id,
    product: productId,
  });

  if (!addOnWishList) {
    throw new ApiError("faild to add on wishlist");
  }

  resp
    .status(200)
    .json(
      new ApiResponse("successfully added on wishlist", 200, addOnWishList)
    );
});

export const getWishListProduct = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError("please provide id");
  }

  const findWishList = await WishList.find({ addedBy: _id }).populate(
    "product"
  );

  if (!findWishList) {
    throw new ApiError("wishlist is empty");
  }

  resp.status(200).json(new ApiResponse("", 200, findWishList));
});

export const deleteWishListProduct = asyncHandler(async (req, resp) => {
  const { productId } = req.body;
  const { _id } = req.user;

  if (!productId || !_id) {
    throw new ApiError("please provide required info");
  }

  const findOnWishList = await WishList.findOneAndDelete({
    addedBy: _id,
    product: productId,
  });

  if (!findOnWishList) {
    throw new ApiError("product not found");
  }

  resp
    .status(200)
    .json(new ApiResponse("product deleted successfully", 200, findOnWishList));
});

export const wishListAndCartCount = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError("please provide id");
  }

  const wishListCount = await WishList.find({ addedBy: _id }).countDocuments();
  const cartCount = await Cart.find({ addedBy: _id }).countDocuments();

  resp.status(200).json(new ApiResponse("", 200, { wishListCount, cartCount }));
});

export const getAllMyProducts = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  const findProduct = await Product.find({ addedBy: _id });

  resp.json(new ApiResponse("", 200, findProduct));
});
