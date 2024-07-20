var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Product } from "../model/product-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ProductZodSchema } from "../zodschema/product/product.js";
export const addProduct = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        const error = errorFormatter((_b = validateInfo.error) === null || _b === void 0 ? void 0 : _b.format());
        console.log(error);
        resp.status(400).json({ success: false, error });
        return;
    }
    console.log(images);
    const uploadOnCloudinary = yield uploadImageOnCloudinary(images, 'products');
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
    resp.status(200).json(new ApiResponse("successfully added product", 200, saveProductOnDb));
}));
