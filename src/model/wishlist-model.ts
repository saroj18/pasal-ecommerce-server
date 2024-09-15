import mongoose, { Document, Schema } from "mongoose";

interface WishListType extends Document {
  product: Schema.Types.ObjectId;
  addedBy: Schema.Types.ObjectId;
}

const WishListSchema: Schema<WishListType> = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export const WishList = mongoose.model<WishListType>(
  "wishlist",
  WishListSchema
);
