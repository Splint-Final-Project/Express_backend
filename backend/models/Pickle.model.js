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

    isCancelled: {
      type: Boolean,
      required: true,
      default: false,
    },

    //예: 스타벅스 강남역점
    place: {
      type: String,
      required: true,
    },

    //예: 서울특별시 강남구 역삼동 123-45
    address: {
      type: String,
      // required: true,
    },

    //예: 건물 2층
    detailedAddress: {
      type: String,
      // required: true,
    },

    //법정 구 코드
    areaCode: {
      type: Number,
      // required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
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

    imgUrl: {
      type: String,
    },

    goals: [
      {
        type: String,
      }
    ],

    // 노출 시킬 필요 없는 것
    viewCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Pickle = mongoose.model("Pickle", pickleSchema);

export default Pickle;
