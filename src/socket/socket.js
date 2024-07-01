import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

export const getReceiverSocketIds = (receiverIds) => {
  return receiverIds.map(receiverId => {
    return userSocketMap[receiverId];
  }).filter(socketId => socketId); // 유효한 소켓 ID만 반환
};

export const socketIdMaps = (receiverIds) => {
	const result = {};

  receiverIds.forEach(receiverId => {
    const socketId = userSocketMap[receiverId];
    if (socketId) {
      result[receiverId] = socketId;
    }
  });

  return result; 
}

const userSocketMap = {};

io.on("connection", async (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	const conversationId = socket.handshake.query.conversationId;

	if (userId != "undefined") userSocketMap[userId] = socket.id;

	// const conversation = await Conversation.findById(conversationId).lean();

	// const totalMessages = conversation.messages.length;
	// const startIndex = Math.max(totalMessages - 15, 0);
	// const endIndex = totalMessages;
	// const messages = conversation.messages.slice(startIndex, endIndex);

	// for await (const messageId of messages) {
	// 	const message = await Message.findById(messageId).lean();
	// 	const unReadReceivers = message.receivers.filter(receiver => receiver.receiverId.toString() === userId.toString() && !receiver.isRead);
	// 	console.log(unReadReceivers)

	// 	unReadReceivers.forEach(receiver => receiver.isRead = true);

	// 	const updatedReceivers = message.receivers.map(receiver => {
	// 		if (!receiver.isRead && receiver.receiverId.toString() === userId.toString()) {
	// 				return { ...receiver, isRead: true };
	// 		}
	// 		return receiver;
	// 	});
	
	// 	// 메시지의 receivers 필드를 업데이트
	// 	await Message.updateOne({ _id: messageId }, { $set: { receivers: updatedReceivers } });
	// }

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