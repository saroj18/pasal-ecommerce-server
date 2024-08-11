import mongoose, { Schema } from "mongoose";
const ShopSchema = new Schema({
    shopName: {
        type: String,
        required: true,
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    location: {
        type: Object,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    shopImage: {
        type: String,
        required: true,
        trim: true,
    },
    documentImage: {
        type: String,
        required: true,
        trim: true,
    },
    yourImage: {
        type: String,
        required: true,
        trim: true,
    },
    shopAddress: {
        type: String,
        required: true,
    },
    monthlyTurnover: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
export const Shop = mongoose.model("shop", ShopSchema);
