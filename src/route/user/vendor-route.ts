import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import {
  getAllaVerifiedVendor,
  getSingleVendor,
  getUnverifiedVendor,
  vendorVefify,
} from "../../controller/vendor-controller.js";

export const vendorRoute = Router();

vendorRoute.route("/").get(Auth, getAllaVerifiedVendor);
vendorRoute.route("/unverified").get(Auth, getUnverifiedVendor);
vendorRoute.route("/verify").post(Auth, vendorVefify);
vendorRoute.route("/:id").get(Auth, getSingleVendor);
