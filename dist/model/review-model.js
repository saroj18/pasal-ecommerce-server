import mongoose, { Schema } from "mongoose";
const ReviewSchema = new Schema({
    reviewBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    reviewProduct: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "product",
    },
    reviewMessage: {
        type: String,
        required: true,
        trim: true,
    },
    reviewStar: {
        type: Number,
        required: true,
        default: 0,
    },
    starArray: [
        {
            type: Number,
            required: true,
        },
    ],
}, {
    timestamps: true,
});
export const Review = mongoose.model("review", ReviewSchema);
