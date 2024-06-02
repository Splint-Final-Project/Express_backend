import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
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
      required: true,
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
