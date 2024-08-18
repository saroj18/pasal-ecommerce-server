import mongoose, { Schema } from "mongoose";

interface ReviewType extends Document {
  reviewBy: Schema.Types.ObjectId;
  reviewProduct: Schema.Types.ObjectId;
  reviewMessage: string;
  reviewStar: Number;
  averageReview: Number;
  starArray: Number[];
}

const ReviewSchema: Schema<ReviewType> = new Schema(
  {
    reviewBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    reviewProduct: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    reviewMessage: {
      type: String,
      required: true,
      trim: true,
    },
    reviewStar: {
      type: Number,
      required: true,
      default: 0,
    },
    starArray: [
      {
        type: Number,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model<ReviewType>("review", ReviewSchema);
