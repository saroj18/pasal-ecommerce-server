import { Router } from "express";
import { getAllChatForCustomerAndVendor, getMyChatCustomer } from "../../controller/chat-controller.js";
import { Auth } from "../../middleware/auth.js";
export const chatRoute = Router();
chatRoute.route("/").get(Auth, getAllChatForCustomerAndVendor);
chatRoute.route("/getallcustomer").get(Auth, getMyChatCustomer);
