import mongoose from "mongoose";
import { esewaOrderForm } from "../helper/esewaOrderForm.js";
import { Cart } from "../model/cart-model.js";
import { Order } from "../model/order.model.js";
import { Product } from "../model/product-model.js";
import { WishList } from "../model/wishlist-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {
  deleteFromCloudinary,
  uploadImageOnCloudinary,
} from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ProductZodSchema } from "../zodschema/product/product.js";
import { ObjectId } from "mongodb";

//product add by seller
export const addProduct = asyncHandler(async (req, resp) => {
  const {
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
  } = JSON.parse(req.body.productInfo);
  const images = req.files as Express.Multer.File[];

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
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const uploadOnCloudinary = await uploadImageOnCloudinary(images, "products");

  const saveProductOnDb = await Product.create({
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
});

//get productInventory for seller
export const getInventoryOfProducts = asyncHandler(async (req, resp) => {
  const id = req.shopId;

  if (!id) {
    throw new ApiError("you are unauthorized person");
  }

  // const findProducts = await Product.find({ addedBy: id }).populate({
  //   path: "addedBy",
  //   select: "-refreshToken -password",
  // });
  // console.log(findProducts);

  const findProducts = await Product.aggregate([
    {
      $match: {
        addedBy: new ObjectId(id),
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
      $addFields: {
        totalSaleAmount: {
          $multiply: ["$totalSale", "$priceAfterDiscount"],
        },
      },
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, findProducts));
});

//get all products for all users
export const getAllProducts = asyncHandler(async (req, resp) => {
  const findProducts = await Product.aggregate([
    {
      $lookup: {
        from: "shops",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
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
      $addFields: {
        addedBy: {
          $arrayElemAt: ["$addedBy", 0],
        },
        review: { $arrayElemAt: ["$review", 0] },
        rating: {
          $avg: "$starArray",
        },
      },
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, findProducts));
});

//get single product for customer
export const getSingleProduct = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  const findProduct = await Product.aggregate([
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
        totalSale: { $first: "$totalSale" },
        review: {
          $push: "$review",
        },
        priceAfterDiscount: { $first: "$priceAfterDiscount" },
      },
    },
    {
      $addFields: {
        rating: {
          $avg: "$starArray",
        },
      },
    },
  ]);

  if (!findProduct) {
    throw new ApiError("product not found");
  }

  await Product.findByIdAndUpdate(id, {
    $push: {
      visitDate: new Date(),
    },
  });

  const relatedProducts = await Product.find({
    category: findProduct[0].category,
  })
    .populate("review")
    .limit(10);

  const ourOtherProducts = await Product.find({
    addedBy: findProduct[0].addedBy,
  });

  findProduct[0].relatedProducts = relatedProducts;
  findProduct[0].ourOtherProducts = ourOtherProducts;

  resp.status(200).json(new ApiResponse("", 200, findProduct[0]));
});

//delete products for seller
export const deleteProduct = asyncHandler(async (req, resp) => {
  const { id } = req.params;

  const findProduct = await Product.findByIdAndDelete(id);

  if (!findProduct) {
    throw new ApiError("product not found");
  }

  resp
    .status(200)
    .json(new ApiResponse("product deleted successfully", 200, findProduct));
});

//update product for seller
export const updateProduct = asyncHandler(async (req, resp) => {
  const { id } = req.params;
  const {
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
  } = req.body;

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
    const error = errorFormatter(validateInfo.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const updateProduct = await Product.findByIdAndUpdate(
    id,
    {
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
    },
    {
      new: true,
    }
  );

  if (!updateProduct) {
    throw new ApiError("product not found");
  }

  resp
    .status(200)
    .json(new ApiResponse("product updated successfully", 200, updateProduct));
});

//add on wishlist for customer
export const addOnWishlist = asyncHandler(async (req, resp) => {
  const { productId } = req.body;
  const { _id } = req.user;

  if (!productId || !_id) {
    throw new ApiError("please provide id");
  }

  const findProduct = await Product.findById(productId);

  if (!findProduct) {
    throw new ApiError("product not found");
  }

  const findOnWishList = await WishList.findOne({
    addedBy: _id,
    product: productId,
  });

  if (findOnWishList) {
    await WishList.findOneAndDelete({
      addedBy: _id,
      product: productId,
    });
    await Product.findByIdAndUpdate(productId, {
      $set: {
        isOnWishList: false,
      },
    });
    resp
      .status(200)
      .json(new ApiResponse("product remove from wishlist", 200, null));
    return;
  }

  const addOnWishList = await WishList.create({
    addedBy: _id,
    product: productId,
  });

  if (!addOnWishList) {
    throw new ApiError("faild to add on wishlist");
  }

  await Product.findByIdAndUpdate(productId, {
    $set: {
      isOnWishList: true,
    },
  });

  resp
    .status(200)
    .json(
      new ApiResponse("successfully added on wishlist", 200, addOnWishList)
    );
});

//get wishlistproduct for customer
export const getWishListProduct = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError("please provide id");
  }

  const findWishList = await WishList.find({ addedBy: _id }).populate(
    "product"
  );

  if (!findWishList) {
    throw new ApiError("wishlist is empty");
  }

  resp.status(200).json(new ApiResponse("", 200, findWishList));
});

//delete product from wishlist fro customer
export const deleteWishListProduct = asyncHandler(async (req, resp) => {
  const { productId } = req.body;
  const { _id } = req.user;

  if (!productId || !_id) {
    throw new ApiError("please provide required info");
  }

  const findOnWishList = await WishList.findOneAndDelete({
    addedBy: _id,
    product: productId,
  });

  if (!findOnWishList) {
    throw new ApiError("product not found");
  }
  await Product.findByIdAndUpdate(productId, {
    $set: {
      isOnWishList: false,
    },
  });

  resp
    .status(200)
    .json(new ApiResponse("product deleted successfully", 200, findOnWishList));
});

//get cart and wishlist product count for customer
export const wishListAndCartCount = asyncHandler(async (req, resp) => {
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError("please provide id");
  }

  const wishListCount = await WishList.find({ addedBy: _id }).countDocuments();
  const cartCount = await Cart.find({ addedBy: _id }).countDocuments();

  resp.status(200).json(new ApiResponse("", 200, { wishListCount, cartCount }));
});

//get all products which is added by seller
export const getAllMyProducts = asyncHandler(async (req, resp) => {
  const { id } = req.query;

  const findProduct = await Product.find({ addedBy: id || req.shopId });

  resp.json(new ApiResponse("", 200, findProduct));
});

// for bestselling product on home page and seller dashboard
export const bestSellingProducts = asyncHandler(async (req, resp) => {
  if (req.role == "customer") {
    const product = await Product.find()
      .populate("review")
      .sort({ totalSale: -1 })
      .limit(8);
    resp.status(200).json(new ApiResponse("", 200, product));
    return;
  }

  const product = await Product.find({ addedBy: req.shopId })
    .populate("review")
    .sort({ totalSale: -1 })
    .limit(5);

  const topCategory = await Product.aggregate([
    {
      $match: {
        addedBy: new mongoose.Types.ObjectId(req.shopId),
      },
    },
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
      $limit: 5,
    },
  ]);

  console.log("sa", topCategory);

  resp.status(200).json(new ApiResponse("", 200, { product, topCategory }));
});

//get product for our popular product field on home page
export const suggestRandomProducts = asyncHandler(async (req, resp) => {
  const product = await Order.aggregate([
    {
      $match: {
        purchaseBy: req.user,
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
      $unwind: "$product",
    },

    {
      $group: {
        _id: "$product._id",
        category: { $first: "$product.category" },
      },
    },
  ]);

  const category = product
    .map((ele) => {
      return ele.category;
    })
    .filter((ele, index, arr) => {
      return index === arr.indexOf(ele);
    });

  const allProduct = await Product.find({
    category: {
      $in: category,
    },
  })
    .populate("review")
    .limit(8);

  resp.status(200).json(new ApiResponse("", 200, allProduct));
});

export const filterProducts = asyncHandler(async (req, resp) => {
  let { brand, rating, category, price } = req.body;
  price = price && price.split("-");
  rating = rating && rating.split("");
  console.log(Number(rating[1]));
  console.log(Number(rating[0]));
  let id = Number(req.query.id) || 1;

  const product = await Product.aggregate([
    {
      $addFields: {
        rating: { $ifNull: [{ $avg: "$starArray" }, 0] },
      },
    },
    {
      $match: {
        ...(brand && { brand }),
        ...(category && { category }),
        ...(rating && {
          rating: {
            $gte: Number(rating[0]),
            $lt: Number(rating[1]),
          },
        }),
        ...(price && {
          priceAfterDiscount:
            Number(price) == 25000
              ? { $gt: Number(price) }
              : { $gt: Number(price[0]), $lt: Number(price[1]) },
        }),
      },
    },
    {
      $sort: {
        priceAfterDiscount: id as 1 | -1,
      },
    },
    {
      $lookup: {
        from: "reviews",
        localField: "review",
        foreignField: "_id",
        as: "review",
      },
    },
  ]);

  resp.status(200).json(new ApiResponse("", 200, product));
});
