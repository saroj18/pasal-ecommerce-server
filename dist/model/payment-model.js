import mongoose, { Schema } from "mongoose";
const PaymentSchema = new Schema({
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
}, {
    timestamps: true,
});
export const Payment = mongoose.model("payment", PaymentSchema);
