import { ObjectId, Schema } from "mongoose";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { Auth } from "./auth.js";
import { generateAccessTokenAndRefreshToken } from "../controller/user-controller.js";

interface TokenPayload extends JwtPayload {
  _id: Schema.Types.ObjectId;
  email: string;
  role: string;
  username: string;
}

export const publicAuth = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, shopId } = req.cookies;
    console.log(accessToken);

    if (!accessToken) {
      resp.status(401);
      throw new ApiError("please provide token first");
    }
    const decodAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRETE as string
    ) as TokenPayload;

    if (!decodAccessToken) {
      resp.status(401);
      throw new Error("Invalid token");
    }

    const findUser = await User.findById(decodAccessToken._id);

    if (!findUser) {
      resp.status(404);
      throw new ApiError("User not found");
    }

    if (findUser.role !== "seller" && findUser.role !== "admin") {
      resp.status(401);
      throw new ApiError("unauthorized request");
    }
    req.user = findUser._id;
    req.shopId = shopId;
    req.role = findUser.role;
    next();
  } catch (error) {
    try {
      if (error.name == "TokenExpiredError") {
        const { refreshToken, shopId } = req.cookies;

        if (!refreshToken) {
          throw new Error("please provide refreshToken");
        }

        const decode = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRETE
        ) as JwtPayload;

        const findUser = await User.findById(decode._id);

        if (!findUser) {
          throw new Error("user not found");
        }

        const { accessToken, refreshToken: refresh } =
          await generateAccessTokenAndRefreshToken(findUser._id as ObjectId);

        findUser.refreshToken = refresh;
        await findUser.save();

        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          path: "/",
        } as CookieOptions;

        resp.cookie("accessToken", accessToken, options);
        resp.cookie("refreshToken", refresh, options);
        shopId ? resp.cookie("shopId", shopId, options) : null;

        req.cookies.accessToken = accessToken;
        req.cookies.refreshToken = refresh;
        shopId ? (req.cookies.shopId = shopId) : null;

        await publicAuth(req, resp, next);
        return;
      }
    } catch (err) {
      return resp.status(400).json({ success: false, error: err.message });
    }
    return resp.status(400).json({ success: false, error: error.message });
  }
};
