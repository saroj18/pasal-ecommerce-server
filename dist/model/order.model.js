import mongoose, { Schema } from "mongoose";
const OrderSchema = new Schema({
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
}, {
    timestamps: true,
});
export const Order = mongoose.model("order", OrderSchema);
