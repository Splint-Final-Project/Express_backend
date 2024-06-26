import mongoose from "mongoose";

import updatePickleStatus from "../models/updatePickleStatus.js";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to MongoDB");

    setInterval(updatePickleStatus, 1000 * 60 * 1); // 1분마다 실행
  } catch (error) {
    console.log("Error connecting to MongoDB", error.message);
  }
};

export default connectToMongoDB;
