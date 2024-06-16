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
      enum: ["Pending", "Active"],
      required: false,
      default: "Pending",
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
    company: {
      type: String,
      required: false,
    },
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
      type: Number,
      default: 1500, //  가입시 1500포인트 지급
      min: 0,
    },
    // Participation 테이블에 저장
    // myPickles: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Pickle",
    //   },
    // ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
