import { CookieOptions } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "./user-controller.js";
import { Schema } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Shop } from "../model/shop-details-model.js";

export const loginWithGoogle = asyncHandler(async (req, resp) => {
  const email = req.user.emails[0].value;
  const username = req.user.displayName;
  const findUser = await User.findOne({ email });
  const fullname = req.user._json.name;

  if (!findUser) {
    const saveOnDb = await User.create({
      username,
      email,
      role: "customer",
      fullname,
      signUpAs: "customer",
      password: "login_from_google",
    });

    if (!saveOnDb) {
      throw new ApiError("Failed to save on db");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(
        findUser._id as Schema.Types.ObjectId
      );

    saveOnDb.refreshToken = refreshToken;
    await saveOnDb.save();

    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    };

    resp.cookie("accessToken", accessToken, options);
    resp.cookie("refreshToken", refreshToken, options);

    resp.redirect(process.env.AFTER_GOOGLE_LOGIN_URL);
    return;
  }

  if (findUser?.block) {
    throw new ApiError("You are blocked by Admin");
  }

  findUser.role = "customer";
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

  resp.redirect(process.env.AFTER_GOOGLE_LOGIN_URL);
  return;
});
