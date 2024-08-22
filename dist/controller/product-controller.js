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
import { uploadImageOnCloudinary, } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ProductZodSchema } from "../zodschema/product/product.js";
import { ObjectId } from "mongodb";
//product add by seller
export const addProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description, brand, barganing, chating, stock, category, features, price, discount, } = JSON.parse(req.body.productInfo);
    const images = req.files;
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
        addedBy: req.shopId,
        priceAfterDiscount: price - (price * Number(discount)) / 100,
        userDiscount: Number(discount),
    });
    if (!saveProductOnDb) {
        throw new Error("faild to save on db");
    }
    resp
        .status(200)
        .json(new ApiResponse("successfully added product", 200, saveProductOnDb));
}));
//get productInventory for seller
export const getInventoryOfProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.shopId;
    if (!id) {
        throw new ApiError("you are unauthorized person");
    }
    const findProducts = yield Product.find({ addedBy: id }).populate({
        path: "addedBy",
        select: "-refreshToken -password",
    });
    console.log(findProducts);
    resp.status(200).json(new ApiResponse("", 200, findProducts));
}));
//get all products for all users
export const getAllProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const findProducts = yield Product.find().populate([
        {
            path: "addedBy",
            select: "-refreshToken -password",
        },
        {
            path: "review",
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, findProducts));
}));
//get single product for customer
export const getSingleProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(id);
    const findProduct = yield Product.aggregate([
        {
            $match: {
                _id: new ObjectId(id),
            },
        },
        {
            $lookup: {
                from: "shops",
                localField: "addedBy",
                foreignField: "_id",
                as: "addedBy",
            },
        },
        {
            $unwind: "$addedBy",
        },
        {
            $lookup: {
                from: "reviews",
                localField: "review",
                foreignField: "_id",
                as: "review",
            },
        },
        {
            $unwind: {
                path: "$review",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "review.reviewBy",
                foreignField: "_id",
                as: "review.reviewBy",
            },
        },
        {
            $unwind: {
                path: "$review.reviewBy",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "review.reviewProduct",
                foreignField: "_id",
                as: "review.reviewProduct",
            },
        },
        {
            $unwind: {
                path: "$review.reviewProduct",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                description: { $first: "$description" },
                brand: { $first: "$brand" },
                barganing: { $first: "$barganing" },
                chating: { $first: "$chating" },
                stock: { $first: "$stock" },
                category: { $first: "$category" },
                features: { $first: "$features" },
                price: { $first: "$price" },
                discount: { $first: "$discount" },
                images: { $first: "$images" },
                addedBy: { $first: "$addedBy" },
                starArray: { $first: "$starArray" },
                isOnWishList: { $first: "$isOnWishList" },
                offer: { $first: "$offer" },
                review: {
                    $push: "$review",
                },
                priceAfterDiscount: { $first: "$priceAfterDiscount" },
            },
        },
    ]);
    if (!findProduct) {
        throw new ApiError("product not found");
    }
    const relatedProducts = yield Product.find({
        category: findProduct[0].category,
    })
        .populate("review")
        .limit(10);
    const ourOtherProducts = yield Product.find({
        addedBy: findProduct[0].addedBy,
    });
    findProduct[0].relatedProducts = relatedProducts;
    findProduct[0].ourOtherProducts = ourOtherProducts;
    resp.status(200).json(new ApiResponse("", 200, findProduct[0]));
}));
//delete products for seller
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
//update product for seller
export const updateProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, description, brand, barganing, chating, stock, category, features, price, discount, } = req.body;
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
        images: "UPDATE",
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
        priceAfterDiscount: price - (price * Number(discount)) / 100,
        userDiscount: Number(discount),
    }, {
        new: true,
    });
    if (!updateProduct) {
        throw new ApiError("product not found");
    }
    resp
        .status(200)
        .json(new ApiResponse("product updated successfully", 200, updateProduct));
}));
//add on wishlist for customer
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
        yield WishList.findOneAndDelete({
            addedBy: _id,
            product: productId,
        });
        yield Product.findByIdAndUpdate(productId, {
            $set: {
                isOnWishList: false,
            },
        });
        resp
            .status(200)
            .json(new ApiResponse("product remove from wishlist", 200, null));
        return;
    }
    const addOnWishList = yield WishList.create({
        addedBy: _id,
        product: productId,
    });
    if (!addOnWishList) {
        throw new ApiError("faild to add on wishlist");
    }
    yield Product.findByIdAndUpdate(productId, {
        $set: {
            isOnWishList: true,
        },
    });
    resp
        .status(200)
        .json(new ApiResponse("successfully added on wishlist", 200, addOnWishList));
}));
//get wishlistproduct for customer
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
//delete product from wishlist fro customer
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
    yield Product.findByIdAndUpdate(productId, {
        $set: {
            isOnWishList: false,
        },
    });
    resp
        .status(200)
        .json(new ApiResponse("product deleted successfully", 200, findOnWishList));
}));
//get cart and wishlist product count for customer
export const wishListAndCartCount = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    if (!_id) {
        throw new ApiError("please provide id");
    }
    const wishListCount = yield WishList.find({ addedBy: _id }).countDocuments();
    const cartCount = yield Cart.find({ addedBy: _id }).countDocuments();
    resp.status(200).json(new ApiResponse("", 200, { wishListCount, cartCount }));
}));
//get all products which is added by seller
export const getAllMyProducts = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const findProduct = yield Product.find({ addedBy: id || req.shopId });
    resp.json(new ApiResponse("", 200, findProduct));
}));
