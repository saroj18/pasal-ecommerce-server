import mongoose, { Schema } from "mongoose";
const WishListSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
});
export const WishList = mongoose.model("wishlist", WishListSchema);
