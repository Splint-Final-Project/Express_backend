import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      // unique: true,
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
    occupation: {
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
    myPickles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pickle",
      },
    ],
    // createdAt, updatedAt => Member since <createdAt>
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
