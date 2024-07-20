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
        ref: "user",
    },
});
export const Product = mongoose.model("product", productSchema);
