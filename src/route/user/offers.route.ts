import { Router } from "express";
import {
  createOffer,
  deleteOffers,
  getAllOffers,
} from "../../controller/offers-controller.js";

export const offerRoute = Router();

offerRoute.route("/").post(createOffer).get(getAllOffers).delete(deleteOffers);
