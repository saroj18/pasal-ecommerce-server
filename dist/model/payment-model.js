import mongoose, { Schema } from "mongoose";
const PaymentSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: "order",
        required: true,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
    },
    ref_id: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
export const Payment = mongoose.model("payment", PaymentSchema);
