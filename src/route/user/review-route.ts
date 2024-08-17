import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import {
  createReview,
  getAllMyReviewForSeller,
  getAllReview,
  productForReviewRemainig,
} from "../../controller/review-controller.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";

export const reviewRoute = Router();

reviewRoute.route("/reviewneed").get(Auth, productForReviewRemainig);
reviewRoute.route("/").post(Auth, createReview).get(Auth, getAllReview);
reviewRoute.route("/myreview").get(sellerAuth, getAllMyReviewForSeller);
