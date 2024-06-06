import mongoose from "mongoose";

const pickleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    // 모집 인원
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

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    numParticipants: {
      type: Number,
      required: true,
      defaultValue: 0,
    },

    content: {
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
  }
  ,{ timestamps: true }
);

const Pickle = mongoose.model("Pickle", pickleSchema);

export default Pickle;
