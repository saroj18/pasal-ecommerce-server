import mongoose, { Schema } from "mongoose";
const ChatSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "product",
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
