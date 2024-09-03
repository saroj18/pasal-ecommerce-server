import mongoose, { Schema } from "mongoose";
const VisitorSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    totalVisit: {
        type: Number,
        default: 0,
    },
});
export const Visit = mongoose.model("visit", VisitorSchema);
