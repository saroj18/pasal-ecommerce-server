import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getInventoryOfProducts,
  getSingleProduct,
  updateProduct,
} from "../../controller/product-controller.js";
import { upload } from "../../middleware/multer.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";

export const productRouter = Router();

productRouter
  .route("/add")
  .post(sellerAuth, upload.array("images", 5), addProduct);
productRouter.route("/inventory").get(sellerAuth, getInventoryOfProducts);
productRouter.route("/").get(getAllProducts);
productRouter
  .route("/:id")
  .get(getSingleProduct)
  .delete(sellerAuth, deleteProduct)
  .put(sellerAuth, upload.array("images", 5), updateProduct);
