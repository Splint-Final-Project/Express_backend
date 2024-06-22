//start server
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
import conversationRoutes from "./routes/conversation.routes.js";

import { app, server } from "./socket/socket.js";

import events from "events";
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

import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: "vinoankr@gmail.com",
//     pass: "yfck hcxy sthc xqzr",
//   },
// });

// middleware -> "api/auth/${authRoutes의 경로가 추가: signup, login, logout}"
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pickle", pickleRoutes);
app.use("/api/v1/favorite", favoriteRoutes);

server.listen(PORT, async () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}`);
  // const info = await transporter.sendMail({
  //   from: '"피클타임 운영팀 👻" <pickletime946@gmail.com>', // sender address
  //   to: "vinoankr@gmail.com", // list of receivers
  //   subject: "피클타임 이메일 인증", // Subject line
  //   text: `이메일 인증 코드: `, // plain text body
  //   html: `<h1>이메일 인증 코드: <h1>`, // html body
  // });
  // console.log("Message sent: %s", info.messageId);
});
