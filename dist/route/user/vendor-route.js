import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import { getAllVendor, getSingleVendor } from "../../controller/vendor-controller.js";
export const vendorRoute = Router();
vendorRoute.route("/").get(Auth, getAllVendor);
vendorRoute.route("/:id").get(Auth, getSingleVendor);
