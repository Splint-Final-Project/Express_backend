import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verificationCode: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6,
  },
});

const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;
