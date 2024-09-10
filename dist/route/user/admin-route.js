import { Router } from "express";
import { adminDashboardData, adminLogOut, graphDataForAdminDashboard, topListForAdminDashboard, } from "../../controller/admin-controller.js";
import { adminAuth } from "../../middleware/adminAuth.js";
export const adminRoute = Router();
adminRoute.route("/graphdata").post(adminAuth, graphDataForAdminDashboard);
adminRoute.route("/dashboard").get(adminAuth, adminDashboardData);
adminRoute.route("/toplist").get(adminAuth, topListForAdminDashboard);
adminRoute.route("/logout").get(adminAuth, adminLogOut);
