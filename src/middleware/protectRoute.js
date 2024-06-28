import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// 인가가 필요한 라우트에 대한 미들웨어
// 인가정보가 부족할 때는 401, 추가회원가입 미완료 유저는 403, 유저가 없을 때는 404
const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status !== "active") {
      return res
        .status(403)
        .json({ error: "Unauthorized - User should finish registration" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default protectRoute;
