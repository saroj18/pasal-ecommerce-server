import { Router } from "express";
import { loginUser, signUpUser } from "../../controller/user-controller.js";

export const userRouter=Router()

userRouter.route('/signup').post(signUpUser)
userRouter.route('/login').post(loginUser)