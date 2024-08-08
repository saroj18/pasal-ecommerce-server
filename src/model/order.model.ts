import mongoose, { Schema, Document } from "mongoose";

interface OrderType extends Document {
  product: Schema.Types.ObjectId;
  purchaseBy: Schema.Types.ObjectId;
  deleveryAddress: Schema.Types.ObjectId;
  paymentStatus: string;
  payMethod: string;
  orderComplete: boolean;
  payment: Schema.Types.ObjectId;
  billingAddress: Schema.Types.ObjectId;
  totalPrice: number;
  deleveryCharge: number;
}

const OrderSchema: Schema<OrderType> = new Schema(
  {
    product: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "product",
      },
    ],
    purchaseBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    payMethod: {
      type: String,
      required: true,
    },
    orderComplete: {
      type: Boolean,
      default: false,
    },
    deleveryAddress: {
      type: Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },
    billingAddress: {
      type: Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "payment",
      default: null,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    deleveryCharge: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<OrderType>("order", OrderSchema);
