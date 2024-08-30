import { Router } from "express";
import { sellerDashboardData, shopVerify } from "../../controller/seller-controller.js";
import { upload } from "../../middleware/multer.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";

export const sellerRoute=Router()

sellerRoute.route('/verify').post(sellerAuth,upload.array("images", 3),shopVerify)
sellerRoute.route('/sellerdashboard').get(sellerAuth,sellerDashboardData)