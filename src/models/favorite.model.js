import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    pickleId: {
      type: mongoose.Schema.Types.ObjectId,
			ref: "Pickle",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;