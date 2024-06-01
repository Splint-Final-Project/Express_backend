import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); 
    // $ne는 MongoDB에서 사용하는 비교 연산자 중 하나로, "not equal"을 의미합니다. 즉, $ne는 특정 필드의 값이 주어진 값과 같지 않은 문서를 찾을 때 사용됩니다.

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};