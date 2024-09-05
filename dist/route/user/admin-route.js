import { Router } from "express";
import { adminDashboardData, graphDataForAdminDashboard, topListForAdminDashboard } from "../../controller/admin-controller.js";
export const adminRoute = Router();
adminRoute.route("/graphdata").post(graphDataForAdminDashboard);
adminRoute.route("/dashboard").get(adminDashboardData);
adminRoute.route("/toplist").get(topListForAdminDashboard);
