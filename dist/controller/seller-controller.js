var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Shop } from "../model/shop-details-model.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ShopVerifyZodSchema } from "../zodschema/user/user-signup.js";
export const shopVerify = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [yourImage, documentImage, shopImage] = req.files;
    const { shopDetails } = req.body;
    const { shopName, address, category, turnover, citiNumber, shopLocation } = JSON.parse(shopDetails);
    const { _id } = req === null || req === void 0 ? void 0 : req.user;
    const validateInfo = ShopVerifyZodSchema.safeParse({
        shopName,
        address,
        category,
        turnover,
        citiNumber,
        shopImage,
        documentImage,
        shopLocation,
        yourImage,
    });
    if (validateInfo.error) {
        const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const uploadedImage = yield uploadImageOnCloudinary([shopImage, documentImage, yourImage], "sellerImages");
    const addShop = yield Shop.create({
        shopName,
        owner: _id,
        category,
        monthlyTurnover: turnover,
        citiNumber,
        shopImage: uploadedImage[0],
        documentImage: uploadedImage[1],
        location: shopLocation,
        yourImage: uploadedImage[2],
        shopAddress: address,
    });
    const findUser = yield User.findById(_id);
    if (findUser) {
        findUser.shopVerify = true;
        yield findUser.save();
    }
    resp.cookie("shopId", addShop._id, { httpOnly: true, path: "/" });
    resp
        .status(200)
        .json(new ApiResponse("Shop created successfully", 200, findUser));
}));
