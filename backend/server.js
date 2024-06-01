import express from "express";
import dotenv from  "dotenv";
import cookieParser from "cookie-parser";

import connectToMongoDB from "./db/connectToMongoDB.js";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import { app, server } from "./socket/socket.js";

// const app = express();

dotenv.config();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(cookieParser());

// middleware -> "api/auth/${authRoutes의 경로가 추가: signup, login, logout}"
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}` );
});