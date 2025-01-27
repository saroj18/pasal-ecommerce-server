import { Router } from "express";
import { sellerDashboardData, sellerDashBoardGraphData, shopVerify, } from "../../controller/seller-controller.js";
import { upload } from "../../middleware/multer.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";
import { publicAuth } from "../../middleware/publicAuth.js";
import { Auth } from "../../middleware/auth.js";
export const sellerRoute = Router();
sellerRoute.route("/verify").post(Auth, upload.array("images", 3), shopVerify);
sellerRoute.route("/sellerdashboard").get(sellerAuth, sellerDashboardData);
sellerRoute
    .route("/sellerdashboardgraph")
    .post(publicAuth, sellerDashBoardGraphData);
