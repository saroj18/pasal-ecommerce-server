import dayjs from "dayjs";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Shop } from "../model/shop-details-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../model/product-model.js";
import { Order } from "../model/order.model.js";
import { User } from "../model/user.model.js";
import { DeleveryPerson } from "../model/delevery-person-model.js";

// graph data from admin dashboard
export const graphDataForAdminDashboard = asyncHandler(async (req, resp) => {
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

  const vendor = await Shop.aggregate([
    {
      $match: {
        verified: true,
      },
    },
    {
      $group: {
        _id: "$createdAt",
      },
    },
  ]);

  const sales = await Order.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $group: {
        _id: "$createdAt",
        totalPrice: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  console.log(sales);

  const products = await Product.aggregate([
    {
      $group: {
        _id: "$createdAt",
        totalVisitors: { $first: "$visitDate" },
      },
    },
  ]);
  console.log(">>", products);

  const users = await User.aggregate([
    {
      $match: {
        shopVerify: false,
      },
    },
    {
      $group: {
        _id: "$createdAt",
      },
    },
  ]);

  let dates = [];
  let dateForSale = [];
  let dateForProduct = [];
  let dateForRevenue = [];
  let dateForUser = [];
  let dateForVisit = [];

  if (time == "24hrs") {
    dates = vendor.map((ele) => dayjs(ele._id).format("YY-MM-DD HH"));
    dateForSale = sales.map((ele) => dayjs(ele._id).format("YY-MM-DD HH"));
    dateForRevenue = sales.map((ele) => {
      return {
        date: dayjs(ele._id).format("YY-MM-DD HH"),
        totalPrice: ele.totalPrice,
      };
    });
    dateForProduct = products.map((ele) =>
      dayjs(ele._id).format("YY-MM-DD HH")
    );
    products.forEach((ele) => {
      ele?.totalVisitors?.forEach((element) => {
        dateForVisit.push(dayjs(element).format("YY-MM-DD HH"));
      });
    });
    dateForUser = users.map((ele) => dayjs(ele._id).format("YY-MM-DD HH"));
  } else {
    dates = vendor.map((ele) => dayjs(ele._id).format("YY-MM-DD"));
    dateForSale = sales.map((ele) => dayjs(ele._id).format("YY-MM-DD"));
    dateForRevenue = sales.map((ele) => {
      return {
        date: dayjs(ele._id).format("YY-MM-DD"),
        totalPrice: ele.totalPrice,
      };
    });
    dateForProduct = products.map((ele) => dayjs(ele._id).format("YY-MM-DD"));
    products.forEach((ele) => {
      ele?.totalVisitors?.forEach((element) => {
        dateForVisit.push(dayjs(element).format("YY-MM-DD"));
      });
    });
    dateForUser = users.map((ele) => dayjs(ele._id).format("YY-MM-DD"));
  }
  console.log("dataForrevenue", dateForRevenue);

  const vendorData = [];
  const ordersData = [];
  const productsData = [];
  const revenueData = [];
  const userData = [];
  const visitorData = [];

  dateArray.forEach((ele) => {
    const findDate = dates.filter((date) => date == ele);
    vendorData.push({
      date: ele,
      value: findDate.length,
    });
  });

  dateArray.forEach((ele) => {
    const findDate = dateForSale.filter((date) => date == ele);
    ordersData.push({
      date: ele,
      value: findDate.length,
    });
  });

  dateArray.forEach((ele) => {
    let total = 0;
    dateForRevenue
      .filter((date) => date.date == ele)
      .forEach((ele) => {
        total += ele.totalPrice;
      });
    revenueData.push({
      date: ele,
      value: total,
    });
  });

  dateArray.forEach((ele) => {
    const findDate = dateForProduct.filter((date) => date == ele);
    productsData.push({
      date: ele,
      value: findDate.length,
    });
  });

  dateArray.forEach((ele) => {
    const findDate = dateForUser.filter((date) => date == ele);
    userData.push({
      date: ele,
      value: findDate.length,
    });
  });

  dateArray.forEach((ele) => {
    let data = dateForVisit.filter((date) => date == ele);

    visitorData.push({
      date: ele,
      value: data.length,
    });
  });

  resp.status(200).json(
    new ApiResponse("", 200, {
      vendorData,
      ordersData,
      productsData,
      revenueData,
      userData,
      visitorData,
    })
  );
});

export const adminDashboardData = asyncHandler(async (req, resp) => {
  const totalVendors = await Shop.find({ verified: true }).countDocuments();
  const toatlDeleveryPerson = await DeleveryPerson.find().countDocuments();
  const totalUser = await User.find({ shopVerify: false }).countDocuments();
  const totalCategory = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalProduct: { $sum: 1 },
        totalVisitors: { $sum: { $size: { $ifNull: ["$visitDate", []] } } },
      },
    },
  ]);

  let totalProducts = 0;
  let totalVisitors = 0;
  totalCategory.forEach((ele) => {
    totalProducts += ele.totalProduct;
    totalVisitors += ele.totalVisitors;
  });

  resp.status(200).json(
    new ApiResponse("", 200, {
      totalVendors,
      toatlDeleveryPerson,
      totalUser,
      totalCategory: totalCategory.length,
      totalProducts,
      totalVisitors,
    })
  );
});

export const topListForAdminDashboard = asyncHandler(async (req, resp) => {
  const topVender = await Product.aggregate([
    {
      $group: {
        _id: "$addedBy",
        totalSale: { $sum: "$totalSale" },
      },
    },
    {
      $lookup: {
        from: "shops",
        localField: "_id",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    {
      $limit: 7,
    },
  ]);

  const topSellingProduct = await Product.find()
    .sort({ totalSale: -1 })
    .limit(7);

  const topCategory = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalSale: {
          $sum: "$totalSale",
        },
      },
    },
    {
      $sort: {
        totalSale: -1,
      },
    },
    {
      $limit: 7,
    },
  ]);

  const topExpensiveProduct = await Product.find()
    .sort({ priceAfterDiscount: -1 })
    .limit(7);

  const demo = await Product.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "review",
        foreignField: "_id",
        as: "review",
      },
    },
  ]);

  resp.status(200).json(
    new ApiResponse("", 200, {
      topVender,
      topSellingProduct,
      topCategory,
      topExpensiveProduct,
      demo,
    })
  );
});
