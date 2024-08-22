var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Offer } from "../model/offers.model.js";
import { Product } from "../model/product-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { OfferZodSchema } from "../zodschema/offers/offer.js";
export const createOffer = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, discount, products } = req.body;
    console.log("sora>>>", products);
    const validate = OfferZodSchema.safeParse({ name, discount, products });
    if (!validate.success) {
        const error = errorFormatter((_a = validate.error) === null || _a === void 0 ? void 0 : _a.format());
        resp.status(400).json({ success: false, error });
        return;
    }
    yield Product.updateMany({ _id: { $in: products } }, {
        $set: {
            priceAfterDiscount: {
                $subtract: ["$price", { $multiply: ["$price", discount / 100] }],
            },
        },
    });
    const offer = yield Offer.create({
        name,
        discount,
        product: products,
    });
    resp
        .status(200)
        .json(new ApiResponse("Order Created Successfully", 200, offer));
}));
export const getAllOffers = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const offers = yield Offer.find().populate("product");
    resp.status(200).json(new ApiResponse("", 200, offers));
}));
export const deleteOffers = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const product = yield Offer.findById(id);
    yield Product.updateMany({ _id: { $in: product.product } }, {
        $set: {
            offerDiscount: {
                $subtract: [
                    "$price",
                    { $multiply: ["$price", product.discount / 100] },
                ],
            },
        },
    });
    const offer = yield Offer.findByIdAndDelete(id);
    if (!offer) {
        resp.status(404).json(new ApiResponse("Offer not found", 404, null));
        return;
    }
    resp
        .status(200)
        .json(new ApiResponse("Offer Deleted Successfully", 200, null));
}));
