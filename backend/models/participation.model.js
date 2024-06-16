import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickle",
      required: true,
    },

    payment_uid: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    isLeader: {
      type: Boolean,
      required: true,
      default: false,
    },

    status: {
      type: String,
      enum: ["paid", "refunded", "points"],
      required: true,
    },
  },
  { timestamps: true }
);

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
