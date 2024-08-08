import mongoose, { Schema, Document } from "mongoose";

interface PaymentType extends Document {
  product: Schema.Types.ObjectId;
  payBy: Schema.Types.ObjectId;
  productPrice: number;
  status: string;
  payVia: string;
  ref_id: string;
}

const PaymentSchema: Schema<PaymentType> = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    payVia: {
      type: String,
      required: true,
    },
    ref_id: {
      type: String,
      required: true,
    },
    payBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<PaymentType>("payment", PaymentSchema);
