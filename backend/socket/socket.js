import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:4000"],
		methods: ["GET", "POST"],
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

const userSocketMap = {};

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;

	if (userId != "undefined") userSocketMap[userId] = socket.id;

	// socket.on("chatBotMessage", async (message) => {
	// 	console.log('New message received:', message);

	// 	if (message.startsWith('!!')) {
	// 			console.log("Command detected, triggering music play...");
			
	// 			try {
	// 					const botResponse = await playPickleSoundTrack(message);
	// 					console.log('Bot response:', botResponse);
	// 					socket.emit('newMessage', botResponse);
	// 			} catch (error) {
	// 					console.error('Error playing sound track:', error);
	// 			}
	// 	} else {
	// 		console.log('invalid command');
	// 	}
	// });

	// io.emit() is used to send events to all the connected clients
	// io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// // socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		// io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };