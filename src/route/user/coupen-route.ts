import { Router } from "express";
import { checkCoupen, createCoupen, deleteCoupen, getAllCoupen } from "../../controller/coupen-controller.js";

export const coupenRoute = Router()

coupenRoute.route('/').post(createCoupen).delete(deleteCoupen).get(getAllCoupen)
coupenRoute.route('/checkcoupen').post(checkCoupen)