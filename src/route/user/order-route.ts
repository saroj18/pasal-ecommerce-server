import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import {
  cancledOrder,
  getMyOrder,
  getMyOrderForAdmin,
  getMyOrderForSeller,
  orderCancledBySeller,
  orderHistoryOfVendor,
  orderPlacedBySeller,
  pendingOrder,
  placedOrder,
  productOrder,
} from "../../controller/order-controller.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";

export const orderRoute = Router();

orderRoute.route("/esewa").post(Auth, productOrder);
orderRoute.route("/").get(Auth, getMyOrder);
orderRoute.route("/myorder").get(Auth, pendingOrder);
orderRoute.route("/sellerorder").get(sellerAuth, getMyOrderForSeller);
orderRoute.route("/placed").post(sellerAuth, orderPlacedBySeller);
// .get(Auth, placedOrder);
orderRoute.route("/cancled").post(sellerAuth, orderCancledBySeller);
// .get(Auth, cancledOrder);
orderRoute.route("/history").get(Auth, orderHistoryOfVendor);
orderRoute.route("/:id").get(Auth, getMyOrderForAdmin);
