var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/nodemailer-config.js";
import { resetPasswordEmailContent } from "../utils/reset-password-email-content.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const sendMailForResetPassword = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const findUser = yield User.findOne({ email });
    if (!findUser) {
        throw new ApiError("User not found");
    }
    const generateHash = yield bcrypt.hash(email, 10);
    findUser.verifyToken = generateHash;
    const expiryTime = Date.now() + 180000;
    findUser.verifyTokenExpiry = expiryTime;
    yield findUser.save();
    const resetLink = `${process.env.PASSWORD_RESET_ORIGIN}?token=${generateHash}`;
    const data = yield sendEmail(email, "Password Reset", resetPasswordEmailContent(findUser.fullname, resetLink));
    if (!data) {
        throw new ApiError("failed to send mail");
    }
    resp.status(200).json(new ApiResponse("please check your mail", 200, null));
}));
