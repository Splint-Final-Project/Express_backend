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
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Active", "Cancelled", "Done"],
      default: "Pending",
    },
    isLeader: { type: Boolean, required: true },
    rating: { type: Number, required: false },
    comment: { type: String, required: false },
  },
  { timestamps: true }
);

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
