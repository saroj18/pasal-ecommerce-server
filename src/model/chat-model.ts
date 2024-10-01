import mongoose, { Schema } from "mongoose";

interface ChatType extends Document {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  message: string;
  type: string;
}

const ChatSchema: Schema<ChatType> = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<ChatType>("chat", ChatSchema);
