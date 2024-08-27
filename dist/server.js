import { server } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./dbConnection/db.js";
import { socketConnection } from "./socket/socket.js";
dotenv.config();
connectDB()
    .then(() => {
    server.listen(process.env.PORT, () => {
        console.log("database and server started successfully at port", process.env.PORT);
        socketConnection(server);
    });
})
    .catch((err) => {
    console.log(err.message);
    process.exit(0);
});
