import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/nodemailer-config.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resetPasswordEmailContent } from "../mail-message/reset-password.js";

export const sendMailForResetPassword = asyncHandler(async (req, resp) => {
  const { email } = req.body;

  const findUser = await User.findOne({ email });

  if (!findUser) {
    throw new ApiError("User not found");
  }

  const generateHash = await bcrypt.hash(email, 10);
  findUser.verifyToken = generateHash;
  const expiryTime = Date.now() + 180000;
  findUser.verifyTokenExpiry = expiryTime;
  await findUser.save();
  const resetLink = `${process.env.PASSWORD_RESET_ORIGIN}?token=${generateHash}`;

  const data = await sendEmail(
    email,
    "Password Reset",
    resetPasswordEmailContent(findUser.fullname, resetLink)
  );

  if (!data) {
    throw new ApiError("failed to send mail");
  }

  resp.status(200).json(new ApiResponse("please check your mail", 200, null));
});
