import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorFormatter } from "../utils/errorFormater.js";
import {
  UserAddressZodSchema,
  UserLoginZodSchema,
  UserSignUpZodSchema,
  userVerifyZodSchema,
} from "../zodschema/user/user-signup.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Schema } from "mongoose";
import { CookieOptions } from "express";
import { ApiError } from "../utils/ApiError.js";
import { Address } from "../model/user-address-model.js";
import { Cart } from "../model/cart-model.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Order } from "../model/order.model.js";
import { Shop } from "../model/shop-details-model.js";
import { ObjectId } from "mongodb";

export const generateAccessTokenAndRefreshToken = async (
  id: Schema.Types.ObjectId
) => {
  const userInfo = await User.findById(id);

  if (!userInfo) {
    throw new ApiError("user not found");
  }
  let accessToken = userInfo?.generateAccessToken();
  let refreshToken = userInfo?.generateRefreshToken();
  return { accessToken, refreshToken };
};

export const signUpUser = asyncHandler(async (req, resp) => {
  const { fullname, password, email, role, username } = req.body;
  const validateInfo = UserSignUpZodSchema.safeParse({
    fullname,
    password,
    email,
    role,
    username,
  });
  if (validateInfo?.error) {
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }
  const findUser = await User.findOne({ email });
  if (findUser) {
    throw new ApiError("email already register");
  }
  console.log(findUser);
  const saveOnDb = await User.create({
    username,
    password,
    email,
    role,
    fullname,
    signUpAs: role,
  });
  if (!saveOnDb) {
    throw new Error("faild to save on db");
  }
  resp.status(200).json(new ApiResponse("successfully signup", 200, saveOnDb));
});

export const loginUser = asyncHandler(async (req, resp) => {
  const { email, password, role } = req.body;
  const validateInfo = UserLoginZodSchema.safeParse({ email, password, role });

  if (validateInfo.error) {
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const findUser = await User.findOne({ email });
  if (findUser?.block) {
    throw new ApiError("You are blocked by Admin");
  }
  if (!findUser) {
    throw new ApiError("User not found");
  }

  const checkPassword = await findUser.comparePassword(password);

  if (!checkPassword) {
    throw new ApiError("incorrect password");
  }

  findUser.role = role;
  await findUser.save();
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(
      findUser._id as Schema.Types.ObjectId
    );

  const user = await User.findByIdAndUpdate(findUser._id, { refreshToken });

  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  };
  if (user && user.shopVerify) {
    const shop = await Shop.findOne({ owner: findUser._id });
    if (!shop) {
      throw new ApiError("shop not found");
    }
    resp.cookie("shopId", shop._id, options);
  }
  resp.cookie("accessToken", accessToken, options);
  resp.cookie("refreshToken", refreshToken, options);

  resp.status(200).json(new ApiResponse("Login successfully", 200, findUser));
});

export const userLogOut = asyncHandler(async (req, resp) => {
  const user = await User.findById(req.user);

  if (!user) {
    throw new ApiError("User not found");
  }

  resp.cookie("accessToken", "");
  resp.cookie("refreshToken", "");
  resp.cookie("shopId", "");

  resp.status(200).json(new ApiResponse("logout successfully", 200, null));
});

export const userVerify = asyncHandler(async (req, resp) => {
  const {
    fullname,
    email,
    mobile,
    dob,
    gender,
    state,
    district,
    city,
    tole,
    ward,
    nearBy,
    defaultAddress,
    location,
  } = req.body;

  if (!email && !fullname) {
    const validateInfo = UserAddressZodSchema.safeParse({
      state,
      city,
      district,
      tole,
      ward,
      nearBy,
      defaultAddress,
      location,
    });

    if (validateInfo.error) {
      const error = errorFormatter(validateInfo.error?.format());
      resp.status(400).json({ success: false, error });
      return;
    }

    const createAddress = await Address.create({
      state,
      city,
      tole,
      district,
      ward,
      nearBy,
      defaultAddress,
      location,
      addressOf: req.user._id,
    });

    if (!createAddress) {
      throw new ApiError("faild to save address");
    }

    resp
      .status(200)
      .json(new ApiResponse("successfully added address", 200, createAddress));
    return;
  }

  const validateInfo = userVerifyZodSchema.safeParse({
    fullname,
    email,
    mobile,
    dob,
    gender,
    state,
    district,
    city,
    tole,
    ward,
    nearBy,
    defaultAddress,
    location,
  });

  if (validateInfo.error) {
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const findUser = await User.findOne({ email, fullname });

  if (!findUser) {
    throw new ApiError("user not found");
  }

  if (findUser?.verify) {
    throw new ApiError("Email already verified");
  }

  const createAddress = await Address.create({
    state,
    city,
    tole,
    district,
    ward,
    nearBy,
    defaultAddress,
    location,
    addressOf: req.user._id,
  });

  if (!createAddress) {
    throw new ApiError("faild to save address");
  }

  findUser.gender = gender;
  findUser.dob = dob;
  findUser.mobile = mobile;
  findUser.address = createAddress._id as Schema.Types.ObjectId;
  findUser.verify = true;
  await findUser.save();

  resp.status(200).json(new ApiResponse("successfully verify", 200, null));
});

export const userInfo = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError("please provide id");
  }

  const findUser = await User.findById(_id).populate("address");

  if (!findUser) {
    throw new Error("user not found");
  }

  resp.status(200).json(new ApiResponse("", 200, findUser));
});

export const getAddress = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  const findAddress = await Address.find({ addressOf: _id }).populate(
    "addressOf"
  );

  resp.status(200).json(new ApiResponse("", 200, findAddress));
});

export const addToCart = asyncHandler(async (req, resp) => {
  const { productId, count } = req.body;
  const { _id } = req.user;

  if (!productId || !_id) {
    throw new ApiError("please provide required info");
  }

  const findOnCart = await Cart.findOne({ product: productId, addedBy: _id });

  if (findOnCart) {
    throw new ApiError("product already on cart");
  }

  const addOnCart = await Cart.create({
    product: productId,
    addedBy: _id,
    productCount: count,
  });

  resp.json(new ApiResponse("product added on cart", 200, addOnCart));
});

export const getCartProducts = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  const findCart = await Cart.find({ addedBy: _id }).populate("product");
  console.log(findCart);

  resp.json(new ApiResponse("", 200, findCart));
});

export const deleteCartProduct = asyncHandler(async (req, resp) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError("please provide id");
  }

  const deleteCart = await Cart.findByIdAndDelete(productId);

  if (!deleteCart) {
    throw new ApiError("faild to delete");
  }

  resp.json(new ApiResponse("product deleted from cart", 200, null));
});

export const checkLogin = asyncHandler(async (req, resp) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new ApiError("");
  }

  const decodAccessToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRETE as string
  ) as JwtPayload;

  if (!decodAccessToken) {
    throw new ApiError("Invalid token");
  }

  const findUser = await User.findById(decodAccessToken._id).select(
    "-password -refreshToken"
  );

  if (!findUser) {
    throw new ApiError("User not found");
  }

  resp.json(new ApiResponse("", 200, findUser));
});

export const getAllCustomerUser = asyncHandler(async (req, resp) => {
  const findUser = await User.find().populate("address");

  resp.status(200).json(new ApiResponse("", 200, findUser));
});

export const getMyAllCustomerForSeller = asyncHandler(async (req, resp) => {
  const user = await Order.aggregate([
    { $unwind: "$product" },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productList",
      },
    },
    { $unwind: "$productList" },
    {
      $lookup: {
        from: "shops",
        localField: "productList.addedBy",
        foreignField: "_id",
        as: "ShopDetails",
      },
    },
    {
      $unwind: "$ShopDetails",
    },
    {
      $match: { "ShopDetails._id": new ObjectId(req.shopId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "purchaseBy",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, user));
});

export const getUser = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).populate("address");
  resp.status(200).json(new ApiResponse("", 200, user));
});

export const blockUserByAdmin = asyncHandler(async (req, resp) => {
  const { id } = req.body;

  const data = await User.findByIdAndUpdate(id, {
    $set: {
      block: true,
    },
    new: true,
  });

  resp
    .status(200)
    .json(new ApiResponse("user blocked successfully", 200, data));
});

export const unBlockUserByAdmin = asyncHandler(async (req, resp) => {
  const { id } = req.body;

  const data = await User.findByIdAndUpdate(id, {
    $set: {
      block: false,
    },
    new: true,
  });

  resp
    .status(200)
    .json(new ApiResponse("user unBlocked successfully", 200, data));
});

export const aboutMe = asyncHandler(async (req, resp) => {
  console.log(req.user);
  const user = await User.findById(req.user);

  if (!user) {
    throw new ApiError("User not found");
  }

  resp.status(200).json(new ApiResponse("", 200, user));
});
