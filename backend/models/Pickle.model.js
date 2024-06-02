import mongoose from "mongoose";

const pickleSchema = new mongoose.Schema(
  {
    // 공통
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
      type: Date,
      required: true,
    },

    // {id} url로 접근할 시, 추가로 제공되는 데이터
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

    // 노출 시킬 필요 없는 것
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
  }
);

// 가상 필드 생성
pickleSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (this.participants.length === this.capacity && this.when > now) {
    return '진행 중';
  } else if (this.participants.length === this.capacity && this.when < now) {
    return '종료';
  } else {
    return '모집 중';
  }
});

// 가상 필드를 JSON에 포함
pickleSchema.set('toJSON', { virtuals: true });
pickleSchema.set('toObject', { virtuals: true });

const Pickle = mongoose.model("Pickle", pickleSchema);

export default Pickle;