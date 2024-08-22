import { Offer } from "../model/offers.model.js";
import { Product } from "../model/product-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { OfferZodSchema } from "../zodschema/offers/offer.js";

export const createOffer = asyncHandler(async (req, resp) => {
  const { name, discount, products } = req.body;

  const validate = OfferZodSchema.safeParse({ name, discount, products });

  if (!validate.success) {
    const error = errorFormatter(validate.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  const product = await Product.find({ _id: { $in: products } });

  product.forEach(async (element) => {
    await Product.findByIdAndUpdate(
      element._id,
      {
        $set: {
          discount: discount,
          offer: true,
          priceAfterDiscount: element.price - (element.price * discount) / 100,
        },
      },
      {
        runValidators: true,
      }
    );
  });
  const offer = await Offer.create({
    name,
    discount,
    product: products,
  });
  resp
    .status(200)
    .json(new ApiResponse("Order Created Successfully", 200, offer));
});

export const getAllOffers = asyncHandler(async (req, resp) => {
  const offers = await Offer.find().populate({
    path: "product",
    populate: {
      path: "review",
    },
  });
  resp.status(200).json(new ApiResponse("", 200, offers));
});

export const deleteOffers = asyncHandler(async (req, resp) => {
  const { id } = req.query;
  const offer = await Offer.findById(id);

  let data = await Product.find({ _id: { $in: offer.product } });
  console.log("pro", data);

  data.forEach(async (element) => {
    await Product.findByIdAndUpdate(
      element._id,
      {
        $set: {
          discount: element.userDiscount,
          offer: false,
          priceAfterDiscount:
            element.price - (element.price * element.userDiscount) / 100,
        },
      },
      {
        runValidators: true,
      }
    );
  });

  await Offer.findByIdAndDelete(id);
  if (!offer) {
    resp.status(404).json(new ApiResponse("Offer not found", 404, null));
    return;
  }

  resp
    .status(200)
    .json(new ApiResponse("Offer Deleted Successfully", 200, null));
});
