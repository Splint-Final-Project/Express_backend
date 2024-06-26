import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Pickle from "../models/Pickle.model.js";
import Participation from "../models/participation.model.js";
import { conversationFormat } from "./dto/conversation.dto.js";
import { findProceedingPickles } from "./services/pickle.service.js";

export const getConversationList = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { category } = req.query;

    const { filteredPickles, todayPickles } = await findProceedingPickles(
      senderId
    );
    const proceedingPickles = [...filteredPickles, ...todayPickles];
    await createGroupConversation(proceedingPickles);

    // 필터링
    const conversationList = await filterConversationsByQuery(
      category,
      senderId
    );

    // dto
    const updatedConversationList = [];

    for await (const conversation of conversationList) {
      if (conversation.pickleId) {
        const pickle = await Pickle.findById(conversation.pickleId);

        const lastMessage = await Message.findById(
          conversation?.messages[conversation?.messages.length - 1]
        );
        const result = await countUnreadMessages(conversation?.messages, senderId);

        const updatedConversation = {
          ...conversation.toObject(),
          imageUrl: pickle?.imgUrl,
          title: pickle?.title,
          lastMessage: lastMessage?.message,
          lastUpdatedAt: conversation?.updatedAt,
          lastMessageIsTrack: lastMessage?.isTrack,
          unReadNumber: result.unReadNumber,
          isOver: result.isOver
        };
        updatedConversationList.push(updatedConversation);
      }
    }
    const formattedConversationList =
      updatedConversationList.map(conversationFormat);

    return res.status(200).json({ data: formattedConversationList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const countUnreadMessages = async (messages, senderId) => { // messages must be limit 300.
  let unReadNumber = 0;
  for await (const message of messages) {
    const unReadMessage = await Message.countDocuments({
      _id: message._id,
      receivers: {
        $elemMatch: { isRead: false, receiverId: senderId }
      }
    });

    unReadNumber = unReadNumber + unReadMessage;
    if (unReadNumber > 300) {
      return { unReadNumber: unReadNumber, isOver: true };
    }
  }
  return { unReadNumber: unReadNumber, isOver: false };
};

const filterConversationsByQuery = async (query, senderId) => {
  console.log(query)
  let result;

  switch (query) {
    case "one-to-one":
      result = await filterOneToOneChats(senderId);
      break;

    case "group":
      result = await filterOngoingConversations(senderId);
      break;

    default:
      result = await Conversation.find({
        participants: { $in: [senderId] },
      }).populate("pickleId");
  }

  return result;
};

const filterOneToOneChats = async (senderId) => {
  return await Conversation.find({
    participants: { $in: [senderId] },
    isGroup: false,
  }).populate("pickleId");
};

const filterOngoingConversations = async (senderId) => {
  return await Conversation.find({
    participants: { $in: [senderId] },
    isGroup: true,
  }).populate("pickleId");
};

const createGroupConversation = async (proceedingPickles) => {
  const totalConversations = [];

  for await (const proceedingPickle of proceedingPickles) {
    let conversation = await Conversation.findOne({
      pickleId: proceedingPickle._id,
      isGroup: true,
    }).populate("pickleId");

    if (!conversation) {
      const participants = await Participation.find({
        pickle: proceedingPickle._id,
      });

      // 참가자 && 리더
      const participantsList = [];
      let leaderId;
      for (const participantUser of participants) {
        participantsList.push(participantUser.user);

        if (participantUser.isLeader) {
          leaderId = participantUser.user;
        }
      }

      const receivers = participantsList
      .filter(id => id.toString() !== leaderId.toString())
      .map(id => ({
        receiverId: id,
        isRead: false
      }));

      // 첫 메시지: 리더가 생성
      const newMessage = await Message.create({
        senderId: leaderId,
        message: `"${proceedingPickle.title}" 피클 타임에 오신 여러분, 환영합니다.`,
        pickleId: proceedingPickle._id,
        receivers: receivers
      });

      conversation = await Conversation.create({
        participants: participantsList,
        pickleId: proceedingPickle._id,
        isGroup: true,
        messages: [newMessage],
        leaderId: leaderId,
      });
    }

    totalConversations.push(conversation);
  }
};
