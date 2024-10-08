import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import {
  createReview,
  getAllMyReviewForAdmin,
  getAllMyReviewForSeller,
  getAllReview,
  getVendoerAllReviewForAdmin,
  productForReviewRemainig,
} from "../../controller/review-controller.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";
import { publicAuth } from "../../middleware/publicAuth.js";

export const reviewRoute = Router();

reviewRoute.route("/reviewneed").get(Auth, productForReviewRemainig);
reviewRoute.route("/").post(Auth, createReview).get(Auth, getAllReview);
reviewRoute.route("/myreview").get(sellerAuth, getAllMyReviewForSeller);
reviewRoute.route("/vendorreview").get(publicAuth, getVendoerAllReviewForAdmin);
reviewRoute.route("/:id").get(Auth, getAllMyReviewForAdmin);
