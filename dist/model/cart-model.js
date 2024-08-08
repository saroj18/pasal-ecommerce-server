import mongoose, { Schema } from "mongoose";
const CartSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    productCount: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});
export const Cart = mongoose.model('cart', CartSchema);
