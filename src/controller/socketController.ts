import { Schema } from "mongoose";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import WebSocket from "ws";
import { Chat } from "../model/chat-model.js";
import { Product } from "../model/product-model.js";

type SocketMessageType = {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  message: string | boolean;
  type: string;
  product: string;
};

type webRtcMessageType = Pick<
  SocketMessageType,
  "sender" | "receiver" | "type"
> & {
  sdp: RTCSessionDescription;
  candidate?: RTCIceCandidate;
};

export const socketController = (
  socket: WebSocket|null,
  ownSocket:WebSocket,
  data: SocketMessageType | webRtcMessageType
) => {
  console.log("eventName", data);
  switch (data.type) {
    case "typing":
      startTyping(socket, data as SocketMessageType);
      break;
    case "customer_and_vendor_chat":
      chatWithVendorAndCustomer(socket,ownSocket, data as SocketMessageType);
      break;
    case "rtcOffer":
      rtcOfferHandler(socket, data as webRtcMessageType);
      break;
    case "rtcAnswer":
      rtcAnswerHandler(socket, data as webRtcMessageType);
      break;
    case "ice-candidate":
      iceCandidateHandler(socket, data as webRtcMessageType);
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
  } catch (error) {
    console.log('er>>>', error.message);
  }
};

const chatWithVendorAndCustomer = async (
  socket: WebSocket,
  ownSocket:WebSocket,
  { sender, receiver, message, type, product }: SocketMessageType
) => {
  try {
   
    const findUser = await User.findById(receiver);

    if (!findUser) {
      throw new ApiError("user not found");
    }

    const saveChat = await Chat.create({
      sender,
      message,
      type,
      receiver,
      product,
    });

    if (!saveChat) {
      throw new ApiError("failed to save on db");
    }

    if (!socket) {
      console.log('own>>',ownSocket)
      ownSocket.send(
        JSON.stringify({
          type: 'error',
          errorName: 'chatWithVendorAndCustomer',
          message
        })
      )
      return
    }

    const findProduct = await Product.findById(product);

    socket.send(
      JSON.stringify({
        sender,
        message,
        type,
        receiver,
        product: findProduct,
      })
    );
  } catch (error) {
    console.log('err>>', error.message);
   
  }
};

const rtcOfferHandler = async (
  socket: WebSocket,
  { receiver, sender, sdp, type }: webRtcMessageType
) => {
  const findUser = await User.findById(receiver);

  if (!findUser) {
    throw new ApiError("user not found");
  }

  socket.send(
    JSON.stringify({
      sender,
      sdp,
      type,
      receiver,
    })
  );
  console.log("RTC Offer sent successfully");
};

const rtcAnswerHandler = async (
  socket: WebSocket,
  { receiver, sender, sdp, type }: webRtcMessageType
) => {
  const findUser = await User.findById(receiver);

  if (!findUser) {
    throw new ApiError("user not found");
  }

  socket.send(
    JSON.stringify({
      sender,
      sdp,
      type,
      receiver,
    })
  );
  // console.log("RTC Answer sent successfully");
};

const iceCandidateHandler = async (
  socket: WebSocket,
  { receiver, sender, candidate, type }: webRtcMessageType
) => {
  console.log("candidate", candidate);
  console.log("type", type);
  const findUser = await User.findById(receiver);

  if (!findUser) {
    throw new ApiError("user not found");
  }

  socket?.send(
    JSON.stringify({
      sender,
      candidate,
      type,
      receiver,
    })
  );
  console.log("ICE candidate sent successfully");
};
