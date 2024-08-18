import { Router } from "express";
import { Auth } from "../../middleware/auth.js";
import { upload } from "../../middleware/multer.js";
import { addDeleveryPerson, deleteDeleveryPerson, getDeleveryPerson, } from "../../controller/deleveryPerson-controller.js";
export const deleveryPersonRoute = Router();
deleveryPersonRoute
    .route("/")
    .post(Auth, upload.array("images", 3), addDeleveryPerson)
    .get(Auth, getDeleveryPerson)
    .delete(Auth, deleteDeleveryPerson);
