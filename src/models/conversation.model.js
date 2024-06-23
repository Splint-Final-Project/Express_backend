import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],

		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Message",
				default: [],
			},
		],

		pickleId: {
			type: mongoose.Schema.Types.ObjectId,
			rer: "Pickle",
		},

		isGroup: {
			type: Boolean,
			default: false,
		},

		leaderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		}
	},

	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;