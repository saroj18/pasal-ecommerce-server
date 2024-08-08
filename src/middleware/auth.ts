import { Schema } from "mongoose";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

interface TokenPayload extends JwtPayload {
  _id: Schema.Types.ObjectId;
  email: string;
  role: string;
  username: string;
}

export const Auth = asyncHandler(async (req, resp, next) => {
  const { accessToken } = req.cookies;
  console.log(accessToken);

  if (!accessToken) {
    resp.status(401);
    throw new ApiError("please login first");
  }
  const decodAccessToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRETE as string
  ) as TokenPayload;
  console.log("dd", decodAccessToken);

  if (!decodAccessToken) {
    resp.status(401);
    throw new Error("Invalid token");
  }

  const findUser = await User.findById(decodAccessToken._id);

  if (!findUser) {
    resp.status(404);
    throw new ApiError("User not found");
  }
  console.log("sora", findUser);
  req.user = findUser._id;
  next();
});
