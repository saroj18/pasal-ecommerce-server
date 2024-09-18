import { Router } from "express";
import passport from "passport";
import { loginWithGoogle } from "../../controller/login-with-google.js";
export const oauthRoute = Router();
oauthRoute
    .route("/auth/google")
    .get(passport.authenticate("google", { scope: ["email", "profile"] }));
oauthRoute.route("/google/callback").get(passport.authenticate("google", {
    session: false,
}), loginWithGoogle);
