import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// receiverId: {
		// 	type: mongoose.Schema.Types.ObjectId,
		// 	ref: "User",
		// 	// required: true,
		// },
		
		message: {
			type: String,
			required: true,
		},
		// createdAt, updatedAt

		pickleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Pickle",
		}
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;