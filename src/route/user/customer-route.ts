import { Router } from "express";
import {
  checkLogin,
  getAddress,
  getAllCustomerUser,
  getMyAllCustomerForSeller,
  loginUser,
  signUpUser,
  userInfo,
  userVerify,
} from "../../controller/user-controller.js";
import { Auth } from "../../middleware/auth.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";

export const userRouter = Router();

userRouter.route("/signup").post(signUpUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/verify").post(Auth, userVerify);
userRouter.route("/").get(Auth, userInfo);
userRouter.route("/address").get(Auth, getAddress);
userRouter.route("/checklogin").get(checkLogin);
userRouter.route("/allcustomer").get(getAllCustomerUser);
userRouter.route("/allmycustomer").get(sellerAuth, getMyAllCustomerForSeller);
