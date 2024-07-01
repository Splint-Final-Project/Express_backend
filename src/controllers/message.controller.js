import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

import User from "../models/user.model.js";
import {
  socketIdMaps,
  io,
  getReceiverSocketIds,
} from "../socket/socket.js";
import { playPickleSoundTrack } from "../langchain/pickleSoundTrack.js";
import { messageDto } from "./dto/message.dto.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { conversationId } = req.params; // params: "send/:id" routes에서
    const senderId = req.user._id; // 로그인 상태에서 존재함

    const userForProfile = await User.findOne({ _id: senderId });
    const conversation = await Conversation.findOne({
      _id: conversationId,
    }).populate("messages");

    let receivers = conversation.participants
      .filter(id => id.toString() !== senderId.toString())
      .map(id => ({
        receiverId: id,
        isRead: false
      }));
    

    const receiverSocketIds = socketIdMaps(conversation.participants);

    for (const receiverIdInSocket in receiverSocketIds) {
      if (receiverIdInSocket) {
        receivers = receivers.map(receiver => {
          if (!receiver.isRead && receiver.receiverId.toString() === receiverIdInSocket.toString()) {
              return { ...receiver, isRead: true };
          }
          return receiver;
        });
      }
    }

    const newMessage = new Message({
      senderId,
      message,
      receivers: receivers
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    const unReadNumber = newMessage.receivers.filter(receiver => !receiver.isRead).length;
    const newMessageDto = messageDto(newMessage, userForProfile, unReadNumber);

    // // SOCKET IO FUNCTIONALITY WILL GO HERE
    for (const receiverIdInSocket in receiverSocketIds) {
      if (receiverIdInSocket) {
        io.to(receiverSocketIds[receiverIdInSocket]).emit("newMessage", newMessageDto);
      }
    }

    await chatBotMessage(
      conversation,
      message,
      receiverSocketIds,
      req.access_token
    );

    res.status(201).json(newMessageDto);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    return res.status(500).json({ error: error });
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

    let receivers = conversation.participants
      .map(id => ({
        receiverId: id,
        isRead: false
      }));

    for (const receiverIdInSocket in receiverSocketIds) {
      if (receiverIdInSocket) {
        receivers = receivers.map(receiver => {
          if (!receiver.isRead && receiver.receiverId.toString() === receiverIdInSocket.toString()) {
              return { ...receiver, isRead: true };
          }
          return receiver;
        });
      }
    }

    const newMessage = new Message({
      senderId: "6676a2dd02763d733afa8892",
      message: result.messages,
      isTrack: result.isTrack,
      receivers: receivers,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    const unReadNumber = newMessage.receivers.filter(receiver => !receiver.isRead).length;
    const newMessageDto = messageDto(newMessage, userForProfile, unReadNumber);

    for (const receiverIdInSocket in receiverSocketIds) {
      if (receiverIdInSocket) {
        io.to(receiverSocketIds[receiverIdInSocket]).emit("chatBotMessage", newMessageDto);
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

    let receivers = conversation.participants
      .filter(id => id.toString() !== senderId.toString())
      .map(id => ({
        receiverId: id,
        isRead: false
      }));

    const receiverSocketIds = socketIdMaps(conversation.participants);
    for (const receiverIdInSocket in receiverSocketIds) {
      if (receiverIdInSocket) {
        receivers = receivers.map(receiver => {
          if (!receiver.isRead && receiver.receiverId.toString() === receiverIdInSocket.toString()) {
              return { ...receiver, isRead: true };
          }
          return receiver;
        });
      }
    }
    console.log(receivers);

    const newMessage = new Message({
      senderId,
      message,
      receivers: receivers
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    const unReadNumber = newMessage.receivers.filter(receiver => !receiver.isRead).length;
    const newMessageDto = messageDto(newMessage, userForProfile, unReadNumber);

    // SOCKET IO FUNCTIONALITY WILL GO HERE
    for (const receiverIdInSocket in receiverSocketIds) {
      if (receiverIdInSocket) {
        io.to(receiverSocketIds[receiverIdInSocket]).emit("newMessage", newMessageDto);
      }
    }
    res.status(201).json(newMessageDto);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    return res.status(500).json({ error: error });
  }
};

export const getMessagesInOneToOne = async (req, res) => {
  try {
    const { id: userToChatId, pickleId } = req.params;
    const senderId = req.user._id;
    const { page = 1 } = req.query; 
    const pageSize = 15;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
      pickleId: pickleId,
      isGroup: false,
    }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

    if (!conversation) return res.status(200).json({ messages: [], totalPages: 1, currentPage: Number(page) });

    const totalMessages = conversation.messages.length;
    const startIndex = Math.max(totalMessages - page * pageSize, 0);
    const endIndex = totalMessages - (page - 1) * pageSize;
    const messages = conversation.messages.slice(startIndex, endIndex);

    let newMessages = [];
    for await (const messageId of messages) {
      const message = await Message.findById(messageId).lean();
      const unReadNumber = message.receivers.filter(receiver => !receiver.isRead).length;

      const userForProfile = await User.findOne({_id: message.senderId}).lean();
      const newMessageDto = messageDto(message, userForProfile, unReadNumber);

      newMessages.push(newMessageDto);
    }

    const totalPages = Math.ceil(totalMessages / pageSize);
    res.status(200).json({ messages: newMessages, totalPages, currentPage: Number(page) });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    return res.status(500).json({ error: error });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = req.user;
    const { page = 1 } = req.query; 
    const pageSize = 15;

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) return res.status(200).json({ messages: [], totalPages: 1, currentPage: Number(page) });

    // 메시지 배열을 최신 메시지부터
    const totalMessages = conversation.messages.length;
    const startIndex = Math.max(totalMessages - page * pageSize, 0);
    const endIndex = totalMessages - (page - 1) * pageSize;
    const messages = conversation.messages.slice(startIndex, endIndex);

    let newMessages = [];
    for await (const messageId of messages) {
      const message = await Message.findById(messageId).lean();

      const updatedReceivers = message.receivers.map(receiver => {
        if (!receiver.isRead && receiver.receiverId.toString() === user._id.toString()) {
            return { ...receiver, isRead: true };
        }
        return receiver;
      });

      await Message.updateOne({ _id: messageId }, { $set: { receivers: updatedReceivers } });

      const unReadNumber = updatedReceivers.filter(receiver => !receiver.isRead).length;

      const userForProfile = await User.findOne({_id: message.senderId}).lean();
      const newMessageDto = messageDto(message, userForProfile, unReadNumber);

      newMessages.push(newMessageDto);
    }

    const totalPages = Math.ceil(totalMessages / pageSize);

    res.status(200).json({ messages: newMessages, totalPages, currentPage: Number(page) });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    return res.status(500).json({ error: error });
  }
};
