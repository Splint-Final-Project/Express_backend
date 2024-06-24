import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

import User from "../models/user.model.js";
import {
  getReceiverSocketId,
  io,
  getReceiverSocketIds,
} from "../socket/socket.js";
import { playPickleSoundTrack } from "../langchain/pickleSoundTrack.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { conversationId } = req.params; // params: "send/:id" routes에서
    const senderId = req.user._id; // 로그인 상태에서 존재함

    const conversation = await Conversation.findOne({
      _id: conversationId,
    }).populate("messages");
    const userForProfile = await User.findOne({ _id: senderId });

    const newMessage = new Message({
      senderId,
      message,
      profilePic: userForProfile.profilePic,
      senderNickname: userForProfile.nickname,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    console.log("newMessage: ", newMessage);
    console.log("now socketio");

    // // SOCKET IO FUNCTIONALITY WILL GO HERE
    const receiverSocketIds = getReceiverSocketIds(conversation.participants);

    console.log(io);
    console.log(receiverSocketIds);

    for (const receiverSocketId of receiverSocketIds) {
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        console.log(io);
        console.log(receiverSocketId);
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    await chatBotMessage(
      conversation,
      message,
      receiverSocketIds,
      req.access_token
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: error });
  }
};

const chatBotMessage = async (
  conversation,
  message,
  receiverSocketIds,
  token
) => {
  if (!conversation.isGroup) return;

  if (message.startsWith("!!")) {
    const result = await playPickleSoundTrack(message, token);
    const userForProfile = await User.findOne({
      _id: "6676a2dd02763d733afa8892",
    });

    const newMessage = new Message({
      senderId: "6676a2dd02763d733afa8892",
      message: result.messages,
      isTrack: result.isTrack,
      profilePic: userForProfile.profilePic,
      senderNickname: userForProfile.nickname,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    for (const receiverSocketId of receiverSocketIds) {
      if (receiverSocketId) {
        // const messageWithProfile = { ...newMessage._doc, profilePic: userForProfile.profilePic}
        io.to(receiverSocketId).emit("chatBotMessage", newMessage);
      }
    }
  }
};

export const sendMessageOneToOne = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId, pickleId } = req.params; // params: "send/:id" routes에서
    const senderId = req.user._id; // 로그인 상태에서 존재함

    const userForProfile = await User.findOne({ _id: senderId });

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      pickleId: pickleId,
      isGroup: false,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        pickleId: pickleId,
        isGroup: false,
      });
    }

    const newMessage = new Message({
      senderId,
      message,
      profilePic: userForProfile.profilePic,
      senderNickname: userForProfile.nickname,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // SOCKET IO FUNCTIONALITY WILL GO HERE
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: error });
  }
};

export const getMessagesInOneToOne = async (req, res) => {
  try {
    const { id: userToChatId, pickleId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
      pickleId: pickleId,
      isGroup: false,
    }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: error });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // const senderId = req.user._id; // do not use

    const conversation = await Conversation.findOne({
      _id: conversationId,
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: error });
  }
};
