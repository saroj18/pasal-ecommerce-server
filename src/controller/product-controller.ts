import { Product } from "../model/product-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ProductZodSchema } from "../zodschema/product/product.js";

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
  const images= req.files as Express.Multer.File[];
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
    errorFormatter(validateInfo.error?.format());
    const error = errorFormatter(validateInfo.error?.format());
    console.log(error);
    resp.status(400).json({ success: false, error });
    return;
  }
console.log(images)

    const uploadOnCloudinary=await uploadImageOnCloudinary(images,'products');

  const saveProductOnDb=await Product.create({
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
    images:uploadOnCloudinary,
    addedBy: req.user._id,
  });

  if(!saveProductOnDb){
    throw new Error("faild to save on db");
  }

  resp.status(200).json(new ApiResponse("successfully added product", 200, saveProductOnDb));
});
