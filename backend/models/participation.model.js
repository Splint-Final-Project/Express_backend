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
    imp_uid: {
      type: String,
      required: true,
    },
    // payment_amount: {
    //   type: Number,
    //   required: true,
    // },
    //환불되면 걍 삭제해버리기
    // isRefunded: {
    //   type: Boolean,
    //   required: true,
    //   default: false,
    // },
    // status: {
    //   type: String,
    //   required: true,
    //   enum: ["Pending", "Active", "Cancelled", "Done"],
    //   default: "Pending",
    // },
    rating: { type: Number, required: false },
    comment: { type: String, required: false },
  },
  { timestamps: true }
);

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
