import { Offer } from "../model/offers.model.js";
import { Product } from "../model/product-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { OfferZodSchema } from "../zodschema/offers/offer.js";

export const createOffer = asyncHandler(async (req, resp) => {
  const { name, discount, products } = req.body;
  console.log("sora>>>", products);
  const validate = OfferZodSchema.safeParse({ name, discount, products });

  if (!validate.success) {
    const error = errorFormatter(validate.error?.format());
    resp.status(400).json({ success: false, error });
    return;
  }

  await Product.updateMany(
    { _id: { $in: products } },
    {
      $set: {
        priceAfterDiscount: {
          $subtract: ["$price", { $multiply: ["$price", discount / 100] }],
        },
      },
    }
  );

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
  const offers = await Offer.find().populate("product");
  resp.status(200).json(new ApiResponse("", 200, offers));
});

export const deleteOffers = asyncHandler(async (req, resp) => {
  const { id } = req.query;
  const product = await Offer.findById(id);
  await Product.updateMany(
    { _id: { $in: product.product } },
    {
      $set: {
        offerDiscount: {
          $subtract: [
            "$price",
            { $multiply: ["$price", product.discount / 100] },
          ],
        },
      },
    }
  );
  const offer = await Offer.findByIdAndDelete(id);
  if (!offer) {
    resp.status(404).json(new ApiResponse("Offer not found", 404, null));
    return;
  }

  resp
    .status(200)
    .json(new ApiResponse("Offer Deleted Successfully", 200, null));
});
