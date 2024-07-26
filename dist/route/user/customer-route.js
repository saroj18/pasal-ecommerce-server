import { Router } from "express";
import { getAddress, loginUser, signUpUser, userInfo, userVerify } from "../../controller/user-controller.js";
import { Auth } from "../../middleware/auth.js";
export const userRouter = Router();
userRouter.route('/signup').post(signUpUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/verify').post(Auth, userVerify);
userRouter.route('/').get(Auth, userInfo);
userRouter.route('/address').get(Auth, getAddress);
