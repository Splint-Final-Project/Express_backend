import mongoose from "mongoose";

import removeExpiredPickles from "../models/pickleDelete.model.js";

const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI);
		console.log("Connected to MongoDB");


		setInterval(removeExpiredPickles, 24 * 60 * 60 * 1000); // 하루에 한 번 실행
	} catch (error) {
		console.log("Error connecting to MongoDB", error.message);
	}
};

export default connectToMongoDB;