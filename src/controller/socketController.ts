import { Schema } from "mongoose";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import WebSocket from "ws";

type SocketMessageType = {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  message: string | boolean;
  type: string;
};

export const socketController = (
  socket: WebSocket,
  data: SocketMessageType
) => {
  switch (data.type) {
    case "typing":
      startTyping(socket, data);
      break;
    case "customer_and_vendor_chat":
      chatWithVendorAndCustomer(socket, data);
      break;
  }
};

const startTyping = async (
  socket: WebSocket,
  { sender, receiver, message, type }: SocketMessageType
) => {
  try {
    const findUser = await User.findById(receiver);

    if (!findUser) {
      throw new ApiError("user not round");
    }
    socket.send(
      JSON.stringify({
        sender,
        message,
        type,
      })
    );
  } catch (error) {}
};

const chatWithVendorAndCustomer = async (
  socket: WebSocket,
  { sender, receiver, message, type }: SocketMessageType
) => {
  try {
    const findUser = await User.findById(receiver);

    if (!findUser) {
      throw new ApiError("user not found");
    }
    console.log("user", message)

    socket.send(
      JSON.stringify({
        sender,
        message,
        type,
      })
    );
  } catch (error) {}
};
