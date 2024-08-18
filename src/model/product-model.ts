import mongoose, { Schema, Document } from "mongoose";

export interface Product extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  brand: string;
  chating: string;
  barganing: string;
  discount: string;
  features: string[];
  addedBy: Schema.Types.ObjectId;
  images: string[];
  review: Schema.Types.ObjectId[];
  starArray: Number[];
  isOnWishList: boolean;
}

const productSchema: Schema<Product> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    chating: {
      type: String,
      required: true,
      trim: true,
    },
    barganing: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "shop",
    },
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: "review",
      },
    ],
    starArray: [
      {
        type: Number,
      },
    ],
    isOnWishList: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<Product>("product", productSchema);
