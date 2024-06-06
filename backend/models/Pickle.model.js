import mongoose from "mongoose";

const pickleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    cost: {
      type: Number,
      required: true,
    },

    deadLine: {
      type: Date,
      required: true,
    },

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        payment_uid: {
          type: String,
          required: true,
        },
        isLeader: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],

    isCancelled: {
      type: Boolean,
      required: true,
      default: false,
    },

    // 진행 중
    where: {
      type: String,
      required: true,
    },

    when: {
      summary: {
        type: String,
      },

      times: [
        {
          type: Date,
          required: true,
        },
      ],
    },

    category: {
      type: String,
      required: true,
    }, // 어떤 피클 모임인지? (헬스, 스터디)

    explanation: {
      type: String,
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

    // 노출 시킬 필요 없는 것
    viewCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Pickle = mongoose.model("Pickle", pickleSchema);

export default Pickle;
