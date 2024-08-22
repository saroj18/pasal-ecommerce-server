import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    images: {
        type: [String],
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    chating: {
        type: String,
        required: true,
        trim: true,
    },
    barganing: {
        type: String,
        required: true,
        trim: true,
    },
    discount: {
        type: String,
        required: true,
        trim: true,
    },
    features: {
        type: [String],
        required: true,
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: "shop",
    },
    review: [
        {
            type: Schema.Types.ObjectId,
            ref: "review",
        },
    ],
    starArray: [
        {
            type: Number,
        },
    ],
    isOnWishList: {
        type: Boolean,
        default: false,
    },
    totalSale: {
        type: Number,
        default: 0,
    },
    priceAfterDiscount: {
        type: Number,
        default: 0,
    },
    userDiscount: {
        type: Number,
        default: 0,
    },
    offer: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
export const Product = mongoose.model("product", productSchema);
