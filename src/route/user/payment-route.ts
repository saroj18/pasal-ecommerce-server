import { Router } from "express";
import { esewaStatusCheck } from "../../controller/payment-controller.js";
import { productOrder } from "../../controller/product-controller.js";
import { Auth } from "../../middleware/auth.js";

export const paymentRoute = Router();

paymentRoute.route("/esewa").post(Auth, productOrder);
paymentRoute.route("/esewa-status").post(Auth, esewaStatusCheck);
