import mongoose from "mongoose";

const pickleSchema = new mongoose.Schema(
  {
    // participation 테이블에 저장
    participants: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: "User",
    	},
    ],

    title: {
      type: String,
      required: true,
    },

    // 모집 중
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

    // participation 테이블에 저장 -> 1:1 채팅을 위해 필요.
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  // { timestamps: true }
);

// 가상 필드 생성
pickleSchema.virtual("status").get(function () {
  const now = new Date();

  // when.times 배열에서 가장 마지막 시간을 가져옵니다.
  const lastTime = this.when.times[this.when.times.length - 1];

  if (this.participants.length === this.capacity && lastTime > now) {
    return "start";
  } else if (this.participants.length === this.capacity && lastTime < now) {
    return "end";
  } else {
    return "recruiting";
  }
});

// 가상 필드를 JSON에 포함
pickleSchema.set("toJSON", { virtuals: true });
pickleSchema.set("toObject", { virtuals: true });

const Pickle = mongoose.model("Pickle", pickleSchema);

export default Pickle;
