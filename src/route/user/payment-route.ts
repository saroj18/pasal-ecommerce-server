import { Router } from "express";
import { esewaStatusCheck, getPaymentHistory, paymentHistoryOfVendor } from "../../controller/payment-controller.js";
import { Auth } from "../../middleware/auth.js";

export const paymentRoute = Router();


paymentRoute.route("/esewa-status").post(Auth, esewaStatusCheck);
paymentRoute.route("/history").get( getPaymentHistory);
paymentRoute.route("/vendorhistory").get( paymentHistoryOfVendor);
