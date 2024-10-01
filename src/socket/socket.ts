import { Server } from "http";
import { WebSocketServer } from "ws";
import cookie from "cookie";
import { ApiError } from "../utils/ApiError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { socketController } from "../controller/socketController.js";

const socketInfo = new Map();

export const socketConnection = (server: Server) => {
  const socketServer = new WebSocketServer({ server });

  socketServer.on("connection", async (socket, req) => {
    console.log("new client add");
    try {
      const token = cookie.parse(req.headers.cookie);
      if (!token) {
        throw new ApiError("please provide token");
      }

      const decode = jwt.verify(
        token.accessToken,
        process.env.ACCESS_TOKEN_SECRETE
      ) as JwtPayload;

      const user = await User.findById(decode._id);

      if (!user) {
        socket.addEventListener("error", () => {
          throw new Error("user not found");
        });
      }
      socketInfo.set(user._id.toString(), socket)
      user.online = true;
      await user.save();

      socket.on("close", async () => {
        user.online = false;
        await user.save();
      });
      socket.on("message", (data) => {
        let socketData: any = data.toString();
        socketData = JSON.parse(socketData);
        // console.log(socketData);
        socketData.sender = user._id;
        socketController(socketInfo.get(socketData.receiver), socketData);
      });
    } catch (error) {
      console.log(error.message);
    }
  });
};
