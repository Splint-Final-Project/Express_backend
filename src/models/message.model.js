import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		receivers: [
			{ 
				receiverId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				isRead: {
					type: Boolean,
					default: false,
				}
			},
		],
		
		message: {
			type: String,
			required: true,
		},
		// createdAt, updatedAt

		pickleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Pickle",
		},

		isTrack : {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;