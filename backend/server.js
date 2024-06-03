import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectToMongoDB from "./db/connectToMongoDB.js";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import pickleRoutes from "./routes/pickle.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import { app, server } from "./socket/socket.js";

// const app = express();

dotenv.config();
const PORT = process.env.PORT || 8080;

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
app.use("/api/v1/payment", paymentRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}`);
});
