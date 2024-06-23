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

    attendance: {
      type: [Date],
      required: true,
      default: [],
    },

    review: {
      type: {
        date: {
          type: Date,
          required: true,
        },
        stars: {
          type: Number,
          enum: [1, 2, 3, 4, 5],
          required: true,
        },
        content: {
          type: String,
          required: true,
          default: "",
        },
      },
      default: null,
    },
  },
  { timestamps: true }
);

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
