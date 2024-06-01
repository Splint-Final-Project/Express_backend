import mongoose from "mongoose";

const pickleSchema = new mongoose.Schema(
  {
    participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],

    leader: {
      type: mongoose.Schema.Types.ObjectId,
			ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    viewCount: {
      type: Number,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    }
  }
);

const Pickle = mongoose.model("Pickle", pickleSchema);

export default Pickle;