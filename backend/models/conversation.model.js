import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		leader: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

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
	},

	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;