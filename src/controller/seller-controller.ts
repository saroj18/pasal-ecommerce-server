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

export const shopVerify = asyncHandler(async (req, resp) => {
  const [yourImage, documentImage, shopImage] =
    req.files as Express.Multer.File[];
  const { shopDetails } = req.body;
  const { shopName, address, category, turnover, citiNumber, shopLocation } =
    JSON.parse(shopDetails);
  const { _id } = req?.user;

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
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const uploadedImage = await uploadImageOnCloudinary(
    [shopImage, documentImage, yourImage],
    "sellerImages"
  );

  const addShop = await Shop.create({
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

  const findUser = await User.findById(_id);
  if (findUser) {
    findUser.shopVerify = true;
    await findUser.save();
  }

  resp.cookie("shopId", addShop._id, { httpOnly: true, path: "/" });

  resp
    .status(200)
    .json(new ApiResponse("Shop created successfully", 200, findUser));
});

export const sellerDashboardData = asyncHandler(async (req, resp) => {
  const totalProducts = await Product.aggregate([
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

  const totalOrders = await Order.aggregate([
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
        totalSaleAmount:{$sum:"$totalPrice"}
      },
    },
  ]);

  resp.status(200).json(
    new ApiResponse("", 200, {
      products: totalProducts[0],
      orders: totalOrders[0],
    })
  );
});

export const sellerDashBoardGraphData = asyncHandler(async (req, resp) => {
  const { time } = req.body;

  const dateArray = [];

  if (time == "24hrs") {
    for (let i = 0; i < 24; i++) {
      dateArray.push(dayjs().subtract(i, "h").format("YY-MM-DD HH"));
    }
  } else if (time == "7days") {
    for (let i = 0; i < 7; i++) {
      dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
    }
  } else if (time == "1month") {
    for (let i = 0; i < 31; i++) {
      dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
    }
  } else if (time == "6months") {
    for (let i = 0; i < 183; i++) {
      dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
    }
  } else {
    for (let i = 0; i < 365; i++) {
      dateArray.push(dayjs().subtract(i, "d").format("YY-MM-DD"));
    }
  }

  const orders = await Order.aggregate([
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
        dates: {
          $push: "$createdAt",
        },
      },
    },
  ]);

  const totalRevenue = await Order.aggregate([
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
            addedBy: new mongoose.Types.ObjectId(req.shopId),
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

  let dates = [];
  let dateforRevenue = [];

  if (time == "24hrs") {
    dates = orders[0].dates.map((ele) => dayjs(ele).format("YY-MM-DD HH"));
    dateforRevenue = totalRevenue.map((ele) => {
      return {
        date: dayjs(ele._id).format("YY-MM-DD HH"),
        total: ele.amount[0],
      };
    });
  } else {
    dates = orders[0].dates.map((ele) => dayjs(ele).format("YY-MM-DD"));
    dateforRevenue = totalRevenue.map((ele) => {
      return {
        date: dayjs(ele._id).format("YY-MM-DD"),
        total: ele.amount[0],
      };
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
    const findDate = dateforRevenue.filter((d) => d.date == ele);
    revenueData.push({
      date: ele,
      value: findDate[0]?.total || 0,
    });
  });

  resp.status(200).json(new ApiResponse("", 200, { graphData, revenueData }));
});
