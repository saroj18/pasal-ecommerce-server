import mongoose, { Document, Schema } from "mongoose";

type LocationType = {
  lat: number;
  lng: number;
};

interface ShopType extends Document {
  shopName: string;
  owner: Schema.Types.ObjectId;
  location: LocationType;
  category: string;
  image: string;
  shopImage: string;
  documentImage: string;
  yourImage: string;
  monthlyTurnover: string;
  shopAddress: string;
  verified: boolean;
  citiNumber: string;
}

const ShopSchema: Schema<ShopType> = new Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    location: {
      type: Object,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    shopImage: {
      type: String,
      required: true,
      trim: true,
    },
    documentImage: {
      type: String,
      required: true,
      trim: true,
    },
    yourImage: {
      type: String,
      required: true,
      trim: true,
    },
    shopAddress: {
      type: String,
      required: true,
    },
    monthlyTurnover: {
      type: String,
      required: true,
      trim: true,
    },
    citiNumber: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = mongoose.model<ShopType>("shop", ShopSchema);
