import { Router } from "express";
import { addOnWishlist, addProduct, bestSellingProducts, deleteProduct, deleteWishListProduct, getAllMyProducts, getAllProducts, getInventoryOfProducts, getSingleProduct, getWishListProduct, suggestRandomProducts, updateProduct, wishListAndCartCount, } from "../../controller/product-controller.js";
import { upload } from "../../middleware/multer.js";
import { sellerAuth } from "../../middleware/sellerAuth.js";
import { addToCart, deleteCartProduct, getCartProducts, } from "../../controller/user-controller.js";
import { Auth } from "../../middleware/auth.js";
import { graphDataForAdminDashboard } from "../../controller/admin-controller.js";
export const productRouter = Router();
productRouter
    .route("/add")
    .post(sellerAuth, upload.array("images", 5), addProduct);
productRouter.route("/inventory").get(sellerAuth, getInventoryOfProducts);
productRouter.route("/cartandwishlist/count").get(Auth, wishListAndCartCount);
productRouter.route("/").get(getAllProducts);
productRouter.route("/bestselling").get(sellerAuth, bestSellingProducts);
productRouter.route("/graphdataforadmin").get(Auth, graphDataForAdminDashboard);
productRouter.route("/randomproducts").get(Auth, suggestRandomProducts);
productRouter.route("/myproduct").get(sellerAuth, getAllMyProducts);
productRouter
    .route("/cart")
    .post(Auth, addToCart)
    .get(Auth, getCartProducts)
    .delete(Auth, deleteCartProduct);
productRouter
    .route("/wishlist")
    .post(Auth, addOnWishlist)
    .get(Auth, getWishListProduct)
    .delete(Auth, deleteWishListProduct);
productRouter
    .route("/:id")
    .get(getSingleProduct)
    .delete(sellerAuth, deleteProduct)
    .post(sellerAuth, updateProduct);
