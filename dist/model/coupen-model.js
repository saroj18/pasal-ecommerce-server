import mongoose from "mongoose";
import { Schema } from "mongoose";
const CoupenSchema = new Schema({
    coupenName: {
        type: String,
        required: true,
        trim: true
    },
    coupenCode: {
        type: String,
        required: true,
        trim: true
    },
    coupenDiscount: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});
export const Coupen = mongoose.model('coupen', CoupenSchema);
