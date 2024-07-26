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
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ShopVerifyZodSchema } from "../zodschema/user/user-signup.js";
export const shopVerify = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [yourImage, documentImage, shopImage] = req.files;
    const { shopDetails } = req.body;
    const { shopName, shopAddress, category, turnover, citiNumber, shopLocation } = JSON.parse(shopDetails);
    const { _id } = req === null || req === void 0 ? void 0 : req.user;
    console.log(_id);
    const validateInfo = ShopVerifyZodSchema.safeParse({
        shopName,
        shopAddress,
        category,
        turnover,
        citiNumber,
        shopImage,
        documentImage,
        shopLocation,
        yourImage
    });
    if (validateInfo.error) {
        const error = errorFormatter((_a = validateInfo.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    const uploadedImage = yield uploadImageOnCloudinary([shopImage, documentImage, yourImage], "sellerImages");
    const findUser = yield User.findById(_id);
    if (!findUser) {
        throw new ApiError("user not found");
    }
    const saveOnDb = yield Shop.create({
        shopName,
        owner: findUser._id,
        address: findUser.address,
        category,
        turnover,
        citiNumber,
        shopImage: uploadedImage[0],
        documentImage: uploadedImage[1],
        shopLocation,
        yourImage: uploadedImage[2],
        shopAddress
    });
    if (!saveOnDb) {
        throw new Error("faild to save on db");
    }
    resp.status(200).json({ success: true, message: "successfully saved", data: saveOnDb });
}));
