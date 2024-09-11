var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import { Order } from "../model/order.model.js";
import { Product } from "../model/product-model.js";
import { Shop } from "../model/shop-details-model.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ShopVerifyZodSchema } from "../zodschema/user/user-signup.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import { Review } from "../model/review-model.js";
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
export const sellerDashboardData = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const totalProducts = yield Product.aggregate([
        {
            $match: {
                addedBy: new mongoose.Types.ObjectId(req.shopId),
            },
        },
        {
            $group: {
                _id: null,
                totalSaleAmount: {
                    $sum: {
                        $multiply: ["$totalSale", "$priceAfterDiscount"],
                    },
                },
                totalSale: {
                    $sum: "$totalSale",
                },
                totalProducts: { $sum: 1 },
                brands: {
                    $addToSet: "$brand",
                },
                category: {
                    $addToSet: "$category",
                },
            },
        },
        {
            $project: {
                totalSaleAmount: 1,
                totalSale: 1,
                totalProducts: 1,
                totalBrands: { $size: "$brands" },
                totalCategory: { $size: "$category" },
            },
        },
    ]);
    const totalOrders = yield Order.aggregate([
        {
            $match: {
                status: "complete",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $match: {
                product: {
                    $elemMatch: {
                        addedBy: new ObjectId(req.shopId),
                    },
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSaleAmount: { $sum: "$totalPrice" },
            },
        },
    ]);
    resp.status(200).json(new ApiResponse("", 200, {
        products: totalProducts[0],
        orders: totalOrders[0],
    }));
}));
export const sellerDashBoardGraphData = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { time } = req.body;
    const { id } = req.query;
    const dateArray = [];
    if (time == "24hrs") {
        for (let i = 0; i < 24; i++) {
            dateArray.push(dayjs().subtract(i, "h").format("YY-MM-DD HH"));
        }
    }
    else if (time == "7days") {
        for (let i = 0; i < 7; i++) {
            dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
        }
    }
    else if (time == "1month") {
        for (let i = 0; i < 31; i++) {
            dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
        }
    }
    else if (time == "6months") {
        for (let i = 0; i < 183; i++) {
            dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
        }
    }
    else {
        for (let i = 0; i < 365; i++) {
            dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
        }
    }
    const orders = yield Order.aggregate([
        {
            $match: {
                status: "complete",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $match: {
                product: {
                    $elemMatch: {
                        addedBy: new ObjectId(id || req.shopId),
                    },
                },
            },
        },
        {
            $group: {
                _id: null,
                dates: {
                    $push: "$createdAt",
                },
            },
        },
    ]);
    const totalRevenue = yield Order.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $match: {
                product: {
                    $elemMatch: {
                        addedBy: new mongoose.Types.ObjectId(id || req.shopId),
                    },
                },
                status: "complete",
            },
        },
        {
            $group: {
                _id: "$createdAt",
                amount: { $push: "$totalPrice" },
            },
        },
    ]);
    const visitors = yield Product.find({ addedBy: id || req.shopId });
    const review = yield Review.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "reviewProduct",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: "$product",
        },
        {
            $match: {
                "product.addedBy": new ObjectId(id || req.shopId),
            },
        },
        {
            $group: {
                _id: "$createdAt",
            },
        },
    ]);
    let dates = [];
    let dateforRevenue = [];
    let dateForVisit = [];
    let dateForReview = [];
    if (time == "24hrs") {
        dates = (_a = orders[0].dates) === null || _a === void 0 ? void 0 : _a.map((ele) => dayjs(ele).format("YY-MM-DD HH"));
        dateforRevenue = totalRevenue.map((ele) => {
            return {
                date: dayjs(ele._id).format("YY-MM-DD HH"),
                total: ele.amount[0],
            };
        });
        visitors.forEach((ele) => {
            ele.visitDate.forEach((element) => {
                dateForVisit.push(dayjs(element).format("YY-MM-DD HH"));
            });
        });
        review.forEach((ele) => {
            dateForReview.push(dayjs(ele._id).format("YY-MM-DD HH"));
        });
    }
    else {
        dates = orders[0].dates.map((ele) => dayjs(ele).format("YY-MM-DD"));
        dateforRevenue = totalRevenue.map((ele) => {
            return {
                date: dayjs(ele._id).format("YY-MM-DD"),
                total: ele.amount[0],
            };
        });
        visitors.forEach((ele) => {
            ele.visitDate.forEach((element) => {
                dateForVisit.push(dayjs(element).format("YY-MM-DD"));
            });
        });
        review.forEach((ele) => {
            dateForReview.push(dayjs(ele._id).format("YY-MM-DD"));
        });
    }
    const graphData = [];
    dateArray.forEach((ele) => {
        const findDate = dates.filter((date) => date == ele);
        graphData.push({
            date: ele,
            value: findDate.length,
        });
    });
    const revenueData = [];
    dateArray.forEach((ele) => {
        let count = 0;
        dateforRevenue
            .filter((d) => d.date == ele)
            .forEach((ele) => {
            count += ele.total;
        });
        revenueData.push({
            date: ele,
            value: count || 0,
        });
    });
    const totalVisitors = [];
    dateArray.forEach((ele) => {
        let count = 0;
        dateForVisit
            .filter((d) => d == ele)
            .forEach(() => {
            count++;
        });
        totalVisitors.push({
            date: ele,
            value: count || 0,
        });
    });
    const totalReview = [];
    dateArray.forEach((ele) => {
        let count = 0;
        dateForReview
            .filter((d) => d == ele)
            .forEach(() => {
            count++;
        });
        totalReview.push({
            date: ele,
            value: count || 0,
        });
    });
    resp.status(200).json(new ApiResponse("", 200, {
        graphData,
        revenueData,
        totalVisitors,
        totalReview,
    }));
}));
