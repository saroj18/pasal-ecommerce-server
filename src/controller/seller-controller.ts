import { Shop } from "../model/shop-details-model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ShopVerifyZodSchema } from "../zodschema/user/user-signup.js";

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
