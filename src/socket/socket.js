import User from "../models/user.model.js";
import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(httpsServer, {
  cors: {
    origin: "https://pickle-time-frontend.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io',
  transports: ['polling', 'websocket']  // 폴링과 웹소켓을 모두 지원
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

export const getReceiverSocketIds = (receiverIds) => {
  return receiverIds.map(receiverId => {
    return userSocketMap[receiverId];
  }).filter(socketId => socketId); // 유효한 소켓 ID만 반환
};

const userSocketMap = {};

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;

	if (userId != "undefined") userSocketMap[userId] = socket.id;

	// io.emit() is used to send events to all the connected clients
	// io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// // socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		// io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});

	socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
  });

  socket.on('error', (err) => {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    socket.close();
  });
});

export { app, io, server };