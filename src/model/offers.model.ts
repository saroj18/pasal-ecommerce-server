import mongoose, { Schema } from "mongoose";

type OfferType = {
  name: string;
  discount: number;
  offerStatus: boolean;
  product: Schema.Types.ObjectId[];
};

const OfferSchema: Schema<OfferType> = new Schema({
  name: {
    type: String,
    required: true,
  },
  product: [
    {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  discount: {
    type: Number,
    required: true,
  },
  offerStatus: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export const Offer = mongoose.model<OfferType>("offer", OfferSchema);
