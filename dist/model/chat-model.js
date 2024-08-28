import mongoose, { Schema } from "mongoose";
const ChatSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "products",
    },
    message: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        trim: true,
        required: true,
    },
}, {
    timestamps: true,
});
export const Chat = mongoose.model("chat", ChatSchema);
