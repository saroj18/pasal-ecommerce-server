import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorFormatter } from "../utils/errorFormater.js";
import {
  UserLoginZodSchema,
  UserSignUpZodSchema,
} from "../zodschema/user/user-signup.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Schema } from "mongoose";

const generateAccessTokenAndRefreshToken = async (
  id: Schema.Types.ObjectId
) => {
  const userInfo = await User.findById(id);
  
  if(!userInfo){
    throw new Error("user not found");
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
    throw new Error("email already register");
  }
  console.log(findUser)
  const saveOnDb = await User.create({
    username,
    password,
    email,
    role,
    fullname,
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
    if (!findUser) {
        throw new Error("User not found");
    }

  const checkPassword = await findUser.comparePassword(password);
  console.log('check>>',checkPassword)

  if (!checkPassword) {
    throw new Error("incorrect password");
  }

  findUser.role=role;
  await findUser.save();
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(findUser._id as Schema.Types.ObjectId);

  await User.findByIdAndUpdate(findUser._id, { refreshToken });

  const options = {
    httpOnly: true,
  };

  resp.cookie("accessToken", accessToken, options);
  resp.cookie("refreshToken", refreshToken, options);
  resp.status(200).json(new ApiResponse("Login successfully", 200, findUser));
});
