import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      // unique: true,
      // 이메일 형식 가입일 때에만 unique해야하는데.......
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      required: false,
      default: "pending",
    },
    nickname: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // 법정 구 코드들을 저장
    areaCodes: [
      {
        type: Number,
        // required: true,
      },
    ],
    // company: {
    //   type: String,
    //   required: false,
    // },
    oauthType: {
      type: String || null,
      enum: ["naver", "kakao"],
      required: false,
      default: null,
    },
    oauthId: {
      type: String || null,
      required: false,
      default: null,
    },
    points: {
      type: {
        current: {
          type: Number,
          required: true,
          min: 0,
        },
        history: {
          type: [
            {
              type: {
                type: String,
                enum: ["earn", "use"],
                required: true,
              },
              message: {
                type: String,
                required: true,
              },
              date: {
                type: Date,
                required: true,
              },
              amount: {
                type: Number,
                required: true,
              },
              remaining: {
                type: Number,
                required: true,
              },
            },
          ],
          required: true,
        },
      },
      required: true,
      default: {
        current: 1500,
        history: [
          {
            type: "earn",
            message: "가입 축하 포인트",
            date: new Date(),
            amount: 1500,
            remaining: 1500,
          },
        ],
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
