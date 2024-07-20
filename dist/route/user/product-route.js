import { Router } from "express";
import { addProduct } from "../../controller/product-controller.js";
import { upload } from "../../middleware/multer.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";
export const productRouter = Router();
productRouter.route('/add').post(sellerAuth, upload.array('images', 5), addProduct);
