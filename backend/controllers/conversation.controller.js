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

    const { filteredPickles, todayPickles } = await findProceedingPickles(senderId);
    const proceedingPickles = [ ...filteredPickles, ...todayPickles ];
    await createGroupConversation(proceedingPickles);

    // 필터링
		const conversationList = await filterConversationsByQuery(category, senderId);

    // dto
    const updatedConversationList = [];

    for await (const conversation of conversationList) {
      if (conversation.pickleId) {
        const pickle = await Pickle.findById(conversation.pickleId);
        
        const lastMessage = await Message.findById(conversation?.messages[conversation?.messages.length -1]);

        const updatedConversation = {
            ...conversation.toObject(),
            imageUrl: pickle?.imgUrl,
            title: pickle?.title,
            lastMessage: lastMessage.message,
            lastUpdatedAt: conversation.updatedAt
        }
        updatedConversationList.push(updatedConversation);
      }
    }
    const formattedConversationList = updatedConversationList.map(conversationFormat);

		res.status(200).json({data: formattedConversationList});
	} catch (error) {
    console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const filterConversationsByQuery = async (query, senderId) => {
  let result;

  switch (query) {
    case "1:1 문의":
      result = await filterOneToOneChats(senderId);
      break;

    case "진행 중":
      result = await filterOngoingConversations(senderId);
      break;

    default:
      result = await Conversation.find({
        participants: { $in: [senderId] }
      }).populate('pickleId');
  }

  return result;
};

const filterOneToOneChats = async (senderId) => {
  return await Conversation.find({
    participants: { $in: [senderId] },
    isGroup: false,
  }).populate('pickleId');
};

const filterOngoingConversations = async (senderId) => {
  return await Conversation.find({
    participants: { $in: [senderId] },
    isGroup: true,
  }).populate('pickleId');
}

 
const createGroupConversation = async (proceedingPickles) => {
  const totalConversations = [];

  for await (const proceedingPickle of proceedingPickles) {
    let conversation = await Conversation.findOne({
			pickleId: proceedingPickle._id,
      isGroup: true,
		}).populate('pickleId');

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

      // 첫 메시지: 리더가 생성
      const newMessage = await Message.create({
        senderId: leaderId,
        message: `"${proceedingPickle.title}" 피클 타임에 오신 여러분, 환영합니다.`,
        pickleId: proceedingPickle._id
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
}