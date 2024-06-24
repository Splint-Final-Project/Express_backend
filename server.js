import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectToMongoDB from "./src/db/connectToMongoDB.js";

import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import pickleRoutes from "./src/routes/pickle.routes.js";
import favoriteRoutes from "./src/routes/favorite.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";

import { app, server } from "./src/socket/socket.js";

import events from "events";
dotenv.config();

const PORT = process.env.PORT || 3000;

events.EventEmitter.defaultMaxListeners = 20;

// 보안
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pickle", pickleRoutes);
app.use("/api/v1/favorite", favoriteRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}`);
});
