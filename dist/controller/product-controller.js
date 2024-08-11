var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Cart } from "../model/cart-model.js";
import { Product } from "../model/product-model.js";
import { WishList } from "../model/wishlist-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { deleteFromCloudinary, uploadImageOnCloudinary, } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ProductZodSchema } from "../zodschema/product/product.js";
export const addProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description, brand, barganing, chating, stock, category, features, price, discount, } = JSON.parse(req.body.productInfo);
    const images = req.files;
    console.log(images);
    const validateInfo = ProductZodSchema.safeParse({
        name,
        description,
        brand,
        barganing,
        chating,
        stock,
        category,
        features,
        price,
        discount,
        images,
    });
    if (!validateInfo.success) {
        const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const uploadOnCloudinary = yield uploadImageOnCloudinary(images, "products");
    const saveProductOnDb = yield Product.create({
        name,
        description,
        brand,
        barganing,
        chating,
        stock,
        category,
        features,
        price,
        discount,
        images: uploadOnCloudinary,
        addedBy: req.user._id,
    });
    if (!saveProductOnDb) {
        throw new Error("faild to save on db");
    }
    resp
        .status(200)
        .json(new ApiResponse("successfully added product", 200, saveProductOnDb));
}));
export const getInventoryOfProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    if (!_id) {
        throw new ApiError("you are unauthorized person");
    }
    const findProducts = yield Product.find({ addedBy: _id }).populate({
        path: "addedBy",
        select: "-refreshToken -password",
    });
    console.log(findProducts);
    resp.status(200).json(new ApiResponse("", 200, findProducts));
}));
export const getAllProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const findProducts = yield Product.find().populate({
        path: "addedBy",
        select: "-refreshToken -password",
    });
    resp.status(200).json(new ApiResponse("", 200, findProducts));
}));
export const getSingleProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const findProduct = yield Product.findById(id);
    if (!findProduct) {
        throw new ApiError("product not found");
    }
    resp.status(200).json(new ApiResponse("", 200, findProduct));
}));
export const deleteProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const findProduct = yield Product.findByIdAndDelete(id);
    if (!findProduct) {
        throw new ApiError("product not found");
    }
    resp
        .status(200)
        .json(new ApiResponse("product deleted successfully", 200, findProduct));
}));
export const updateProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, description, brand, barganing, chating, stock, category, features, price, discount, image, } = req.body;
    yield deleteFromCloudinary(image);
    const images = req.files;
    const uploadOnCloudinary = yield uploadImageOnCloudinary(images, "products");
    const validateInfo = ProductZodSchema.safeParse({
        name,
        description,
        brand,
        barganing,
        chating,
        stock,
        category,
        features,
        price,
        discount,
        images: uploadOnCloudinary,
    });
    if (!validateInfo.success) {
        const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const updateProduct = yield Product.findByIdAndUpdate(id, {
        name,
        description,
        brand,
        barganing,
        chating,
        stock,
        category,
        features,
        price,
        discount,
    });
    if (!updateProduct) {
        throw new ApiError("product not found");
    }
    resp
        .status(200)
        .json(new ApiResponse("product updated successfully", 200, updateProduct));
}));
export const addOnWishlist = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.body;
    const { _id } = req.user;
    if (!productId || !_id) {
        throw new ApiError("please provide id");
    }
    const findProduct = yield Product.findById(productId);
    if (!findProduct) {
        throw new ApiError("product not found");
    }
    const findOnWishList = yield WishList.findOne({
        addedBy: _id,
        product: productId,
    });
    if (findOnWishList) {
        throw new ApiError("product already on wishlist");
    }
    const addOnWishList = yield WishList.create({
        addedBy: _id,
        product: productId,
    });
    if (!addOnWishList) {
        throw new ApiError("faild to add on wishlist");
    }
    resp
        .status(200)
        .json(new ApiResponse("successfully added on wishlist", 200, addOnWishList));
}));
export const getWishListProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    if (!_id) {
        throw new ApiError("please provide id");
    }
    const findWishList = yield WishList.find({ addedBy: _id }).populate("product");
    if (!findWishList) {
        throw new ApiError("wishlist is empty");
    }
    resp.status(200).json(new ApiResponse("", 200, findWishList));
}));
export const deleteWishListProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.body;
    const { _id } = req.user;
    if (!productId || !_id) {
        throw new ApiError("please provide required info");
    }
    const findOnWishList = yield WishList.findOneAndDelete({
        addedBy: _id,
        product: productId,
    });
    if (!findOnWishList) {
        throw new ApiError("product not found");
    }
    resp
        .status(200)
        .json(new ApiResponse("product deleted successfully", 200, findOnWishList));
}));
export const wishListAndCartCount = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    if (!_id) {
        throw new ApiError("please provide id");
    }
    const wishListCount = yield WishList.find({ addedBy: _id }).countDocuments();
    const cartCount = yield Cart.find({ addedBy: _id }).countDocuments();
    resp.status(200).json(new ApiResponse("", 200, { wishListCount, cartCount }));
}));
export const getAllMyProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const findProduct = yield Product.find({ addedBy: _id });
    resp.json(new ApiResponse("", 200, findProduct));
}));
