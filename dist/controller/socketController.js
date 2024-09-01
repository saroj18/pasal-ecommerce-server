var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../model/chat-model.js";
import { Product } from "../model/product-model.js";
export const socketController = (socket, data) => {
    switch (data.type) {
        case "typing":
            startTyping(socket, data);
            break;
        case "customer_and_vendor_chat":
            chatWithVendorAndCustomer(socket, data);
            break;
    }
};
const startTyping = (socket_1, _a) => __awaiter(void 0, [socket_1, _a], void 0, function* (socket, { sender, receiver, message, type }) {
    try {
        const findUser = yield User.findById(receiver);
        if (!findUser) {
            throw new ApiError("user not round");
        }
        socket.send(JSON.stringify({
            sender,
            message,
            type,
        }));
    }
    catch (error) {
        console.log(error.message);
    }
});
const chatWithVendorAndCustomer = (socket_1, _a) => __awaiter(void 0, [socket_1, _a], void 0, function* (socket, { sender, receiver, message, type, product }) {
    try {
        const findUser = yield User.findById(receiver);
        if (!findUser) {
            throw new ApiError("user not found");
        }
        const saveChat = yield Chat.create({
            sender,
            message,
            type,
            receiver,
            product,
        });
        if (!saveChat) {
            throw new ApiError("failed to save on db");
        }
        const findProduct = yield Product.findById(product);
        socket.send(JSON.stringify({
            sender,
            message,
            type,
            receiver,
            product: findProduct,
        }));
    }
    catch (error) {
        console.log(error.message);
    }
});
