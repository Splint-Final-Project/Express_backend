import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectToMongoDB from "./db/connectToMongoDB.js";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import pickleRoutes from "./routes/pickle.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";

import { app, server } from "./socket/socket.js";

import events from 'events';

dotenv.config();
const PORT = process.env.PORT || 8080;

events.EventEmitter.defaultMaxListeners = 20;

// 보안
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// middleware -> "api/auth/${authRoutes의 경로가 추가: signup, login, logout}"
app.use("/api/v1/user", authRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pickle", pickleRoutes);
app.use("/api/v1/favorite", favoriteRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}`);
});
