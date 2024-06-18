import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Pickle from "../models/Pickle.model.js";
import { conversationFormat } from "./dto/conversation.dto.js";

export const getConversationList = async (req, res) => {
	try {
		const senderId = req.user._id;

		const conversationList = await Conversation.find({
			participants: { $in: [senderId] }
		}).populate('pickleId');

    const updatedConversationList = [];

    for await (const conversation of conversationList) {
      if (conversation.pickleId) {
        const pickle = await Pickle.findById(conversation.pickleId);
        
        const lastMessage = await Message.findById(conversation.messages[conversation.messages.length -1]);

        const updatedConversation = {
            ...conversation.toObject(),
            imageUrl: pickle.imgUrl,
            title: pickle.title,
            lastMessage: lastMessage.message,
            lastUpdatedAt: lastMessage.updatedAt
        }
        updatedConversationList.push(updatedConversation);
      }
    }
    const formattedConversationList = updatedConversationList.map(conversationFormat);
    console.log(formattedConversationList);
		res.status(200).json({data: formattedConversationList});
	} catch (error) {
    console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};