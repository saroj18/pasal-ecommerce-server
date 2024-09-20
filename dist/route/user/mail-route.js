import { Router } from "express";
import { sendMailForResetPassword } from "../../controller/mail-controller.js";
export const mailRoute = Router();
mailRoute.route('/forgotpassword').post(sendMailForResetPassword);
