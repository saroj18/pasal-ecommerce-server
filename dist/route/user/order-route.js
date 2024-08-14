import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import { getMyOrder, getMyOrderForSeller, productOrder, } from "../../controller/order-controller.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";
export const orderRoute = Router();
orderRoute.route("/esewa").post(Auth, productOrder);
orderRoute.route("/").get(Auth, getMyOrder);
orderRoute.route("/sellerorder").get(sellerAuth, getMyOrderForSeller);
