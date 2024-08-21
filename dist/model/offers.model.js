import mongoose, { Schema } from "mongoose";
const OfferSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    product: [
        {
            type: Schema.Types.ObjectId,
            ref: "product",
        },
    ],
    discount: {
        type: Number,
        required: true,
    },
    offerStatus: {
        type: Boolean,
        required: true,
        default: true,
    },
});
export const Offer = mongoose.model("offer", OfferSchema);
