var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebSocketServer } from "ws";
import cookie from "cookie";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { socketController } from "../controller/socketController.js";
const socketInfo = new Map();
export const socketConnection = (server) => {
    const socketServer = new WebSocketServer({ server });
    socketServer.on("connection", (socket, req) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("new client add");
        try {
            const token = cookie.parse(req.headers.cookie);
            if (!token) {
                throw new ApiError("please provide token");
            }
            const decode = jwt.verify(token.accessToken, process.env.ACCESS_TOKEN_SECRETE);
            const user = yield User.findById(decode._id);
            if (!user) {
                socket.addEventListener("error", () => {
                    throw new Error("user not found");
                });
            }
            socketInfo.set(user._id.toString(), socket);
            user.online = true;
            yield user.save();
            socket.on("close", () => __awaiter(void 0, void 0, void 0, function* () {
                user.online = false;
                yield user.save();
            }));
            socket.on("message", (data) => {
                let socketData = data.toString();
                socketData = JSON.parse(socketData);
                // console.log(socketData);
                socketData.sender = user._id;
                socketController(socketInfo.get(socketData.receiver), socketData);
            });
        }
        catch (error) {
            console.log(error.message);
        }
    }));
};
