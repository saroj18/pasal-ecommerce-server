import mongoose, { Schema, Document } from "mongoose";

export interface OrderType extends Document {
  product: Schema.Types.ObjectId[];
  purchaseBy: Schema.Types.ObjectId;
  deleveryAddress: Schema.Types.ObjectId;
  paymentStatus: string;
  payMethod: string;
  status: string;
  orderComplete: boolean;
  billingAddress: Schema.Types.ObjectId;
  totalPrice: number;
  deleveryCharge: number;
  reviewed: boolean;
  productQty: number;
  cartInfo: any[];
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
    totalPrice: {
      type: Number,
      required: true,
    },
    deleveryCharge: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    reviewed: {
      type: Boolean,
      required: true,
      default: false,
    },
    cartInfo: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<OrderType>("order", OrderSchema);
